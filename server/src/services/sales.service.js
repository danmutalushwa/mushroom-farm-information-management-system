const Sale = require('../models/Sale');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');
const { validateSale, validatePayment, validateInvoice } = require('../validators/sales.validator');

/**
 * Sales Service
 * Handles all sales, payment, and invoicing business logic
 */
class SalesService {
    /**
     * Create a sale from a completed order
     */
    async createSaleFromOrder(orderId, saleData, userId) {
        // Get order
        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        if (order.status !== 'Completed') {
            throw new AppError('Order must be completed before creating a sale', 400);
        }

        // Check if sale already exists for this order
        const existingSale = await Sale.findOne({ orderId });
        if (existingSale) {
            throw new AppError('A sale already exists for this order', 400);
        }

        // Validate sale data
        const validation = validateSale({
            orderId,
            items: order.items,
            tax: order.tax,
            discount: order.discount,
            paymentMethod: saleData.paymentMethod
        });
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        // Create sale initialized at base zero values
        let sale = await Sale.create({
            orderId: order._id,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            items: order.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                productCode: item.productCode,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
            })),
            subtotal: order.subtotal,
            tax: order.tax,
            discount: order.discount,
            totalAmount: order.totalAmount,
            amountPaid: 0,
            balanceDue: order.totalAmount,
            paymentStatus: 'Pending',

            saleDate: saleData.saleDate || new Date(),
            recordedBy: userId,
            notes: saleData.notes || null
        });

        logger.info(`Sale created from order: ${order.orderNumber}`, {
            saleId: sale._id,
            saleNumber: sale.saleNumber,
            orderId: order._id,
            totalAmount: sale.totalAmount,
            recordedBy: userId
        });

        // If payment was made, record it
        if (saleData.amountPaid && saleData.amountPaid > 0) {
            const paymentResult = await this.recordPayment({
                saleId: sale._id,
                amount: saleData.amountPaid,
                paymentMethod: saleData.paymentMethod || 'Cash',
                notes: 'Initial payment for sale'
            }, userId);

            // Re-assign updated sale object values from paymentResult
            sale = paymentResult.sale;
        }

        // Generate invoice using the freshly updated sale record values
        const invoice = await this.generateInvoice(sale._id, userId);

        return {
            sale,
            invoice
        };
    }

    /**
     * Record a payment for a sale
     */
    async recordPayment(paymentData, userId) {
        // Validate payment
        const validation = validatePayment(paymentData);
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        // Get sale
        const sale = await Sale.findById(paymentData.saleId);
        if (!sale) {
            throw new AppError('Sale not found', 404);
        }

        // Debug information 
        logger.info('Sale payment debug', {
            saleId: sale._id,
            saleNumber: sale.saleNumber,
            totalAmount: sale.totalAmount,
            amountPaid: sale.amountPaid,
            balanceDue: sale.balanceDue,
            paymentStatus: sale.paymentStatus
        });

        // DEFENSIVE MATH FIX: Normalize the balance calculation using Math.max
        const remainingBalance = Math.max(0, sale.totalAmount - sale.amountPaid);
        
        if (remainingBalance === 0) {
            throw new AppError('This sale is already fully paid. Balance due is 0.', 400);
        }

        if (paymentData.amount > remainingBalance) {
            throw new AppError(`Payment amount (${paymentData.amount}) exceeds remaining balance (${remainingBalance})`, 400);
        }

        // Create payment
        const payment = await Payment.create({
            saleId: sale._id,
            saleNumber: sale.saleNumber,
            customerId: sale.customerId,
            customerName: sale.customerName,
            amount: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            paymentStatus: 'Paid',
            referenceNumber: paymentData.referenceNumber || null,
            paymentDate: paymentData.paymentDate || new Date(),
            notes: paymentData.notes || null,
            recordedBy: userId
        });

        // Update sale totals cleanly
        sale.amountPaid += paymentData.amount;
        sale.balanceDue = Math.max(0, sale.totalAmount - sale.amountPaid);
        
        // Update payment status explicitly
        if (sale.amountPaid >= sale.totalAmount) {
            sale.paymentStatus = 'Paid';
        } else {
            sale.paymentStatus = 'Partially Paid';
        }
        await sale.save();

        // Update invoice matching status safely
        await Invoice.findOneAndUpdate(
            { saleId: sale._id },
            {
                $set: { 
                    amountPaid: sale.amountPaid,
                    balanceDue: sale.balanceDue, 
                    isPaid: sale.paymentStatus === 'Paid' 
                }
            }
        );

        logger.info(`Payment recorded for sale: ${sale.saleNumber}`, {
            paymentId: payment._id,
            paymentNumber: payment.paymentNumber,
            amount: paymentData.amount,
            saleId: sale._id,
            recordedBy: userId
        });

        return {
            payment,
            sale
        };
    }

    /**
     * Get all sales with pagination and filters
     */
    async getAllSales(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;

        // Build dynamic query filters
        const filter = {};

        if (filters.paymentStatus) {
            filter.paymentStatus = filters.paymentStatus;
        }

        if (filters.customerId) {
            filter.customerId = filters.customerId;
        }

        // Search by customer name, phone number, or order number
        if (filters.search) {
            filter.$or = [
                { customerName: { $regex: filters.search, $options: 'i' } },
                { customerPhone: { $regex: filters.search, $options: 'i' } },
                { orderNumber: { $regex: filters.search, $options: 'i' } }
            ];
        }

        // Filter by date range
        if (filters.startDate && filters.endDate) {
            filter.saleDate = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate)
            };
        }

        // Execute query with parallel aggregation counting
        const [sales, total] = await Promise.all([
            Sale.find(filter)
                .sort({ saleDate: -1 })
                .skip(skip)
                .limit(limit),
            Sale.countDocuments(filter)
        ]);

        return {
            sales,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Generate invoice for a sale
     */
    async generateInvoice(saleId, userId) {
        // Validate
        const validation = validateInvoice({ saleId });
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        // Get sale
        const sale = await Sale.findById(saleId)
            .populate('customerId', 'fullName phoneNumber email address');
        if (!sale) {
            throw new AppError('Sale not found', 404);
        }

        // Check if invoice already exists
        const existingInvoice = await Invoice.findOne({ saleId });
        if (existingInvoice) {
            return existingInvoice;
        }

        // Get customer details
        const customer = sale.customerId;

        // Create invoice
        const invoice = await Invoice.create({
            saleId: sale._id,
            saleNumber: sale.saleNumber,
            orderId: sale.orderId,
            orderNumber: sale.orderNumber,
            customerId: customer._id,
            customerName: customer.fullName,
            customerPhone: customer.phoneNumber,
            customerEmail: customer.email || null,
            customerAddress: customer.address || null,
            items: sale.items,
            subtotal: sale.subtotal,
            tax: sale.tax,
            taxRate: 18, // Default tax rate
            discount: sale.discount,
            totalAmount: sale.totalAmount,
            amountPaid: sale.amountPaid,
            balanceDue: sale.balanceDue,
            invoiceDate: new Date(),
            isPaid: sale.paymentStatus === 'Paid',
            generatedBy: userId,
            notes: sale.notes || null
        });

                logger.info(`Invoice generated for sale: ${sale.saleNumber}`, {
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            saleId: sale._id,
            generatedBy: userId
        });

        return invoice;
    }

    /**
     * Get sale by ID
     */
    async getSaleById(id) {
        const sale = await Sale.findById(id);

        if (!sale) {
            throw new AppError('Sale record not found', 404);
        }

        return sale;
    }

    /**
     * Get sale by business number
     */
    async getSaleByNumber(saleNumber) {
        const sale = await Sale.findOne({ saleNumber });

        if (!sale) {
            throw new AppError(`Sale #${saleNumber} not found`, 404);
        }

        return sale;
    }

    /**
     * Get all payments recorded for a single sale
     */
    async getSalePayments(saleId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = { saleId };

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .sort({ paymentDate: -1 })
                .skip(skip)
                .limit(limit),
            Payment.countDocuments(query)
        ]);

        return {
            payments,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get invoice document associated with a sale
     */
    async getSaleInvoice(saleId) {
        const invoice = await Invoice.findOne({ saleId });

        if (!invoice) {
            throw new AppError('Invoice not found for this sale', 404);
        }

        return invoice;
    }

    /**
     * Generate sales statistics dashboard metrics
     */
    async getSalesStatistics() {
        const stats = await Sale.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalCollected: { $sum: '$amountPaid' },
                    totalOutstanding: { $sum: '$balanceDue' },
                    countSales: { $sum: 1 }
                }
            }
        ]);

        const statusCounts = await Sale.aggregate([
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStatuses = statusCounts.reduce(
            (acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            },
            {
                Paid: 0,
                'Partially Paid': 0,
                Pending: 0
            }
        );

        const mainStats = stats[0] || {
            totalRevenue: 0,
            totalCollected: 0,
            totalOutstanding: 0,
            countSales: 0
        };

        return {
            summary: {
                totalRevenue: mainStats.totalRevenue,
                totalCollected: mainStats.totalCollected,
                totalOutstanding: mainStats.totalOutstanding,
                totalSalesCount: mainStats.countSales
            },
            statuses: formattedStatuses
        };
    }
}

module.exports = SalesService; 

