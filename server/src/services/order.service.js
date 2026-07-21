const Order = require('../models/Order');
const Customer = require('../models/Customer');
const InventoryItem = require('../models/InventoryItem');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');
const { validateOrder, validateStatusUpdate, validateCancellation } = require('../validators/order.validator');

/**
 * Order Service
 * Handles all order management business logic
 */
class OrderService {
    /**
     * Create a new order
     */
    async createOrder(orderData, userId) {
        // Validate input
        const validation = validateOrder(orderData);
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        // Get customer
        const customer = await Customer.findById(orderData.customerId);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        if (!customer.isActive) {
            throw new AppError('Customer is deactivated. Cannot create order', 400);
        }

        // Process items and check inventory
        let subtotal = 0;
        const processedItems = [];

        for (const item of orderData.items) {
            // Get product from inventory
            const product = await InventoryItem.findById(item.productId);
            if (!product) {
                throw new AppError(`Product not found: ${item.productId}`, 404);
            }

            if (!product.isActive) {
                throw new AppError(`Product is deactivated: ${product.itemName}`, 400);
            }

            // Check stock availability
            if (product.quantity < item.quantity) {
                throw new AppError(
                    `Insufficient stock for ${product.itemName}. Available: ${product.quantity}`,
                    400
                );
            }

            // Calculate total price
            const totalPrice = item.quantity * item.unitPrice;
            subtotal += totalPrice;

            processedItems.push({
                productId: product._id,
                productName: product.itemName,
                productCode: product.itemCode,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: totalPrice,
                notes: item.notes || null
            });
        }

        // Calculate totals
        const tax = orderData.tax || 0;
        const discount = orderData.discount || 0;
        const totalAmount = subtotal + tax - discount;

        if (totalAmount < 0) {
            throw new AppError('Total amount cannot be negative', 400);
        }

        // Create order
        const order = await Order.create({
            customerId: customer._id,
            customerName: customer.fullName,
            customerPhone: customer.phoneNumber,
            items: processedItems,
            subtotal,
            tax,
            discount,
            totalAmount,
            orderDate: orderData.orderDate || new Date(),
            expectedDeliveryDate: orderData.expectedDeliveryDate || null,
            deliveryAddress: orderData.deliveryAddress || customer.address,
            notes: orderData.notes || null,
            createdBy: userId
        });

        // Reduce inventory quantities
        for (const item of processedItems) {
            const product = await InventoryItem.findById(item.productId);
            product.quantity -= item.quantity;
            product.lastUpdatedBy = userId;
            await product.save();
        }

        // Update customer purchase stats
        await Customer.findByIdAndUpdate(customer._id, {
            $inc: { totalOrders: 1, totalPurchases: 1, totalSpent: totalAmount },
            lastPurchaseDate: new Date()
        });

        logger.info(`Order created: ${order.orderNumber}`, {
            orderId: order._id,
            customerId: customer._id,
            totalAmount,
            createdBy: userId
        });

        return order;
    }

    /**
     * Get all orders with pagination and filters
     */
    async getAllOrders(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter = {};
        if (filters.status) filter.status = filters.status;
        if (filters.customerId) filter.customerId = filters.customerId;
        if (filters.paymentStatus) filter.paymentStatus = filters.paymentStatus;
        if (filters.search) {
            filter.$or = [
                { orderNumber: { $regex: filters.search, $options: 'i' } },
                { customerName: { $regex: filters.search, $options: 'i' } },
                { customerPhone: { $regex: filters.search, $options: 'i' } }
            ];
        }
        
        // Date range filters
        if (filters.startDate || filters.endDate) {
            filter.orderDate = {};
            if (filters.startDate) filter.orderDate.$gte = new Date(filters.startDate);
            if (filters.endDate) filter.orderDate.$lte = new Date(filters.endDate);
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('customerId', 'fullName phoneNumber email')
                .populate('createdBy', 'fullName email')
                .populate('updatedBy', 'fullName email')
                .populate('cancelledBy', 'fullName email')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Order.countDocuments(filter)
        ]);

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get order by ID
     */
    async getOrderById(orderId) {
        const order = await Order.findById(orderId)
            .populate('customerId', 'fullName phoneNumber email address')
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email')
            .populate('cancelledBy', 'fullName email');

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        return order;
    }

    /**
     * Get order by order number
     */
    async getOrderByNumber(orderNumber) {
        const order = await Order.findOne({ orderNumber })
            .populate('customerId', 'fullName phoneNumber email address')
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email')
            .populate('cancelledBy', 'fullName email');

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        return order;
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId, status, userId) {
        const validation = validateStatusUpdate({ status });
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Don't allow status changes on cancelled or completed orders
        if (order.status === 'Cancelled' || order.status === 'Completed') {
            throw new AppError(`Cannot update status of a ${order.status.toLowerCase()} order`, 400);
        }

        // Validate status transition
        const validTransitions = {
            'Pending': ['Confirmed', 'Cancelled'],
            'Confirmed': ['Processing', 'Cancelled'],
            'Processing': ['Ready for Collection', 'Cancelled'],
            'Ready for Collection': ['Completed', 'Cancelled'],
            'Completed': [],
            'Cancelled': []
        };

        if (!validTransitions[order.status].includes(status)) {
            throw new AppError(`Cannot transition from '${order.status}' to '${status}'`, 400);
        }

        order.status = status;
        order.updatedBy = userId;

        // If status is Completed, set delivery date
        if (status === 'Completed') {
            order.actualDeliveryDate = new Date();
        }

        await order.save();

        logger.info(`Order status updated: ${order.orderNumber}`, {
            orderId: order._id,
            oldStatus: order.status,
            newStatus: status,
            updatedBy: userId
        });

        return order;
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(orderId, paymentStatus, paymentMethod, userId) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Don't allow payment updates on cancelled orders
        if (order.status === 'Cancelled') {
            throw new AppError('Cannot update payment for a cancelled order', 400);
        }

        order.paymentStatus = paymentStatus;
        if (paymentMethod) {
            order.paymentMethod = paymentMethod;
        }
        order.updatedBy = userId;
        await order.save();

        logger.info(`Payment status updated: ${order.orderNumber}`, {
            orderId: order._id,
            paymentStatus,
            paymentMethod,
            updatedBy: userId
        });

        return order;
    }

    /**
     * Cancel order
     */
    async cancelOrder(orderId, reason, userId) {
        const validation = validateCancellation({ reason });
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Don't cancel completed orders
        if (order.status === 'Completed') {
            throw new AppError('Cannot cancel a completed order', 400);
        }

        if (order.status === 'Cancelled') {
            throw new AppError('Order is already cancelled', 400);
        }

        // Restore inventory quantities
        for (const item of order.items) {
            const product = await InventoryItem.findById(item.productId);
            if (product) {
                product.quantity += item.quantity;
                product.lastUpdatedBy = userId;
                await product.save();
            }
        }

        order.status = 'Cancelled';
        order.cancelledAt = new Date();
        order.cancelledBy = userId;
        order.cancellationReason = reason;
        order.updatedBy = userId;
        await order.save();

        logger.info(`Order cancelled: ${order.orderNumber}`, {
            orderId: order._id,
            reason,
            cancelledBy: userId
        });

        return order;
    }

    /**
     * Delete order (Admin only - permanent)
     */
    async deleteOrder(orderId, userId) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Don't delete active orders
        if (order.status !== 'Completed' && order.status !== 'Cancelled') {
            throw new AppError('Cannot delete an active order. Cancel it first', 400);
        }

        await Order.findByIdAndDelete(orderId);

        logger.info(`Order deleted: ${order.orderNumber}`, {
            orderId: order._id,
            deletedBy: userId
        });

        return order;
    }

    /**
     * Get orders by customer
     */
    async getOrdersByCustomer(customerId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        const [orders, total] = await Promise.all([
            Order.find({ customerId })
                .populate('createdBy', 'fullName email')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Order.countDocuments({ customerId })
        ]);

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get order statistics
     */
    async getOrderStatistics() {
        const [
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ status: 'Pending' }),
            Order.countDocuments({ status: 'Completed' }),
            Order.countDocuments({ status: 'Cancelled' }),
            Order.aggregate([
                { $match: { status: 'Completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
        ]);

        return {
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        };
    }
}

module.exports = new OrderService();