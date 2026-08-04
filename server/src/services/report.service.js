const ProductionBatch = require('../models/ProductionBatch');
const InventoryItem = require('../models/InventoryItem');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const StockMovement = require('../models/StockMovement');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');

/**
 * Report Service
 * Handles all report generation logic
 */
class ReportService {
    /**
     * Generate Production Report
     */
    async getProductionReport(startDate, endDate, filters = {}) {
        const dateFilter = {};
        if (startDate) dateFilter.startDate = { $gte: new Date(startDate) };
        if (endDate) dateFilter.startDate = { ...dateFilter.startDate, $lte: new Date(endDate) };

        const matchFilter = { ...dateFilter };
        if (filters.mushroomType) matchFilter.mushroomType = filters.mushroomType;
        if (filters.status) matchFilter.status = filters.status;

        const batches = await ProductionBatch.find(matchFilter)
            .populate('createdBy', 'fullName')
            .sort({ startDate: 1 });

        // Calculate statistics
        const totalBatches = batches.length;
        const totalHarvest = batches.reduce((sum, b) => sum + b.totalHarvest, 0);
        const totalLoss = batches.reduce((sum, b) => sum + b.productionLoss, 0);
        const totalSpawnUsed = batches.reduce((sum, b) => sum + b.spawnQuantity, 0);
        
        // Group by mushroom type
        const byMushroomType = {};
        batches.forEach(batch => {
            if (!byMushroomType[batch.mushroomType]) {
                byMushroomType[batch.mushroomType] = {
                    count: 0,
                    totalHarvest: 0,
                    totalLoss: 0,
                    totalSpawn: 0
                };
            }
            byMushroomType[batch.mushroomType].count++;
            byMushroomType[batch.mushroomType].totalHarvest += batch.totalHarvest;
            byMushroomType[batch.mushroomType].totalLoss += batch.productionLoss;
            byMushroomType[batch.mushroomType].totalSpawn += batch.spawnQuantity;
        });

        // Group by status
        const byStatus = {};
        batches.forEach(batch => {
            if (!byStatus[batch.status]) byStatus[batch.status] = 0;
            byStatus[batch.status]++;
        });

        // Calculate yield efficiency
        const yieldEfficiency = totalSpawnUsed > 0 
            ? ((totalHarvest / totalSpawnUsed) * 100).toFixed(2) 
            : 0;

        return {
            summary: {
                totalBatches,
                totalHarvest,
                totalLoss,
                totalSpawnUsed,
                yieldEfficiency: parseFloat(yieldEfficiency),
                dateRange: { startDate, endDate }
            },
            byMushroomType,
            byStatus,
            batches: batches.map(b => ({
                batchNumber: b.batchNumber,
                mushroomType: b.mushroomType,
                spawnQuantity: b.spawnQuantity,
                totalHarvest: b.totalHarvest,
                productionLoss: b.productionLoss,
                status: b.status,
                startDate: b.startDate,
                expectedHarvestDate: b.expectedHarvestDate,
                actualHarvestDate: b.actualHarvestDate,
                createdBy: b.createdBy?.fullName || 'Unknown'
            }))
        };
    }

    /**
     * Generate Inventory Report
     */
    async getInventoryReport(filters = {}) {
        const matchFilter = { isActive: true };
        if (filters.category) matchFilter.category = filters.category;
        if (filters.search) {
            matchFilter.$or = [
                { itemName: { $regex: filters.search, $options: 'i' } },
                { itemCode: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const items = await InventoryItem.find(matchFilter)
            .populate('createdBy', 'fullName')
            .sort({ category: 1, itemName: 1 });

        // Calculate statistics
        const totalItems = items.length;
        const totalValue = items.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);
        
        // Group by category
        const byCategory = {};
        items.forEach(item => {
            if (!byCategory[item.category]) {
                byCategory[item.category] = {
                    count: 0,
                    totalQuantity: 0,
                    totalValue: 0
                };
            }
            byCategory[item.category].count++;
            byCategory[item.category].totalQuantity += item.quantity;
            byCategory[item.category].totalValue += item.quantity * (item.unitPrice || 0);
        });

        // Low stock items
        const lowStockItems = items.filter(item => item.quantity <= item.minimumStockLevel);
        
        // Out of stock items
        const outOfStockItems = items.filter(item => item.quantity === 0);

        return {
            summary: {
                totalItems,
                totalValue,
                lowStockCount: lowStockItems.length,
                outOfStockCount: outOfStockItems.length
            },
            byCategory,
            items: items.map(item => ({
                itemCode: item.itemCode,
                itemName: item.itemName,
                category: item.category,
                quantity: item.quantity,
                unitOfMeasurement: item.unitOfMeasurement,
                minimumStockLevel: item.minimumStockLevel,
                stockStatus: item.stockStatus,
                unitPrice: item.unitPrice || 0,
                totalValue: item.quantity * (item.unitPrice || 0),
                supplier: item.supplier,
                location: item.location
            })),
            lowStockItems: lowStockItems.map(item => ({
                itemCode: item.itemCode,
                itemName: item.itemName,
                quantity: item.quantity,
                minimumStockLevel: item.minimumStockLevel,
                shortfall: item.minimumStockLevel - item.quantity
            })),
            outOfStockItems: outOfStockItems.map(item => ({
                itemCode: item.itemCode,
                itemName: item.itemName,
                category: item.category
            }))
        };
    }

    /**
     * Generate Customer Report
     */
    async getCustomerReport(filters = {}) {
        const matchFilter = {};
        if (filters.isActive !== undefined) {
            matchFilter.isActive = filters.isActive === 'true';
        }
        if (filters.customerType) matchFilter.customerType = filters.customerType;
        if (filters.search) {
            matchFilter.$or = [
                { fullName: { $regex: filters.search, $options: 'i' } },
                { phoneNumber: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const customers = await Customer.find(matchFilter)
            .populate('createdBy', 'fullName')
            .sort({ totalSpent: -1 });

        // Calculate statistics
        const totalCustomers = customers.length;
        const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
        const activeCustomers = customers.filter(c => c.isActive).length;
        
        // Group by customer type
        const byType = {};
        customers.forEach(customer => {
            if (!byType[customer.customerType]) {
                byType[customer.customerType] = {
                    count: 0,
                    totalSpent: 0,
                    totalOrders: 0
                };
            }
            byType[customer.customerType].count++;
            byType[customer.customerType].totalSpent += customer.totalSpent;
            byType[customer.customerType].totalOrders += customer.totalOrders;
        });

        // Top customers by spending
        const topCustomers = [...customers]
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 10)
            .map(c => ({
                fullName: c.fullName,
                phoneNumber: c.phoneNumber,
                customerType: c.customerType,
                totalOrders: c.totalOrders,
                totalSpent: c.totalSpent,
                lastPurchaseDate: c.lastPurchaseDate
            }));

        // Recent customers
        const recentCustomers = [...customers]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10)
            .map(c => ({
                fullName: c.fullName,
                phoneNumber: c.phoneNumber,
                customerType: c.customerType,
                createdAt: c.createdAt,
                isActive: c.isActive
            }));

        return {
            summary: {
                totalCustomers,
                activeCustomers,
                inactiveCustomers: totalCustomers - activeCustomers,
                totalRevenue,
                averageSpent: totalCustomers > 0 ? totalRevenue / totalCustomers : 0
            },
            byType,
            topCustomers,
            recentCustomers,
            customers: customers.map(c => ({
                customerCode: c.customerCode,
                fullName: c.fullName,
                phoneNumber: c.phoneNumber,
                email: c.email,
                customerType: c.customerType,
                totalOrders: c.totalOrders,
                totalSpent: c.totalSpent,
                lastPurchaseDate: c.lastPurchaseDate,
                isActive: c.isActive,
                createdAt: c.createdAt
            }))
        };
    }

    /**
     * Generate Order Report
     */
    async getOrderReport(startDate, endDate, filters = {}) {
        const dateFilter = {};
        if (startDate) dateFilter.orderDate = { $gte: new Date(startDate) };
        if (endDate) dateFilter.orderDate = { ...dateFilter.orderDate, $lte: new Date(endDate) };

        const matchFilter = { ...dateFilter };
        if (filters.status) matchFilter.status = filters.status;
        if (filters.paymentStatus) matchFilter.paymentStatus = filters.paymentStatus;

        const orders = await Order.find(matchFilter)
            .populate('customerId', 'fullName phoneNumber')
            .populate('createdBy', 'fullName')
            .sort({ orderDate: -1 });

        // Calculate statistics
        const totalOrders = orders.length;
        const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const completedOrders = orders.filter(o => o.status === 'Completed');
        const cancelledOrders = orders.filter(o => o.status === 'Cancelled');
        const pendingOrders = orders.filter(o => o.status === 'Pending');

        // Group by status
        const byStatus = {};
        orders.forEach(order => {
            if (!byStatus[order.status]) byStatus[order.status] = 0;
            byStatus[order.status]++;
        });

        // Daily summary
        const dailySummary = {};
        orders.forEach(order => {
            const date = order.orderDate.toISOString().split('T')[0];
            if (!dailySummary[date]) {
                dailySummary[date] = { count: 0, total: 0 };
            }
            dailySummary[date].count++;
            dailySummary[date].total += order.totalAmount;
        });

        return {
            summary: {
                totalOrders,
                totalAmount,
                completedOrders: completedOrders.length,
                cancelledOrders: cancelledOrders.length,
                pendingOrders: pendingOrders.length,
                averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0,
                dateRange: { startDate, endDate }
            },
            byStatus,
            dailySummary,
            orders: orders.map(o => ({
                orderNumber: o.orderNumber,
                customerName: o.customerName,
                customerPhone: o.customerPhone,
                totalItems: o.items.length,
                totalAmount: o.totalAmount,
                status: o.status,
                paymentStatus: o.paymentStatus,
                orderDate: o.orderDate,
                expectedDeliveryDate: o.expectedDeliveryDate,
                createdBy: o.createdBy?.fullName || 'Unknown'
            }))
        };
    }

    /**
     * Generate Sales Report
     */
    async getSalesReport(startDate, endDate, filters = {}) {
        const dateFilter = {};
        if (startDate) dateFilter.saleDate = { $gte: new Date(startDate) };
        if (endDate) dateFilter.saleDate = { ...dateFilter.saleDate, $lte: new Date(endDate) };

        const matchFilter = { ...dateFilter };
        if (filters.paymentStatus) matchFilter.paymentStatus = filters.paymentStatus;
        if (filters.paymentMethod) matchFilter.paymentMethod = filters.paymentMethod;

        const sales = await Sale.find(matchFilter)
            .populate('customerId', 'fullName phoneNumber')
            .populate('recordedBy', 'fullName')
            .sort({ saleDate: -1 });

        // Calculate statistics
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalPaid = sales.reduce((sum, s) => sum + s.amountPaid, 0);
        const totalDue = totalRevenue - totalPaid;

        // Payment status breakdown
        const paidSales = sales.filter(s => s.paymentStatus === 'Paid');
        const unpaidSales = sales.filter(s => s.paymentStatus === 'Unpaid');
        const partiallyPaidSales = sales.filter(s => s.paymentStatus === 'Partially Paid');

        // Payment method breakdown
        const byPaymentMethod = {};
        sales.forEach(sale => {
            if (sale.paymentMethod) {
                if (!byPaymentMethod[sale.paymentMethod]) {
                    byPaymentMethod[sale.paymentMethod] = { count: 0, total: 0 };
                }
                byPaymentMethod[sale.paymentMethod].count++;
                byPaymentMethod[sale.paymentMethod].total += sale.totalAmount;
            }
        });

        // Daily summary
        const dailySummary = {};
        sales.forEach(sale => {
            const date = sale.saleDate.toISOString().split('T')[0];
            if (!dailySummary[date]) {
                dailySummary[date] = { count: 0, total: 0, paid: 0 };
            }
            dailySummary[date].count++;
            dailySummary[date].total += sale.totalAmount;
            dailySummary[date].paid += sale.amountPaid;
        });

        // Top selling products
        const productSales = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.productName]) {
                    productSales[item.productName] = {
                        productCode: item.productCode,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.productName].quantity += item.quantity;
                productSales[item.productName].revenue += item.totalPrice;
            });
        });

        const topProducts = Object.entries(productSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        return {
            summary: {
                totalSales,
                totalRevenue,
                totalPaid,
                totalDue,
                paidSales: paidSales.length,
                unpaidSales: unpaidSales.length,
                partiallyPaidSales: partiallyPaidSales.length,
                averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
                dateRange: { startDate, endDate }
            },
            byPaymentMethod,
            dailySummary,
            topProducts,
            sales: sales.map(s => ({
                saleNumber: s.saleNumber,
                orderNumber: s.orderNumber,
                customerName: s.customerName,
                customerPhone: s.customerPhone,
                totalAmount: s.totalAmount,
                amountPaid: s.amountPaid,
                balanceDue: s.balanceDue,
                paymentStatus: s.paymentStatus,
                paymentMethod: s.paymentMethod,
                saleDate: s.saleDate,
                recordedBy: s.recordedBy?.fullName || 'Unknown'
            }))
        };
    }

    /**
     * Generate Stock Movement Report
     */
    async getStockMovementReport(startDate, endDate, filters = {}) {
        const dateFilter = {};
        if (startDate) dateFilter.createdAt = { $gte: new Date(startDate) };
        if (endDate) dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(endDate) };

        const matchFilter = { ...dateFilter };
        if (filters.movementType) matchFilter.movementType = filters.movementType;
        if (filters.itemCode) matchFilter.itemCode = filters.itemCode;

        const movements = await StockMovement.find(matchFilter)
            .populate('performedBy', 'fullName')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalMovements = movements.length;
        
        // Group by movement type
        const byType = {};
        movements.forEach(m => {
            if (!byType[m.movementType]) {
                byType[m.movementType] = { count: 0, totalQuantity: 0 };
            }
            byType[m.movementType].count++;
            byType[m.movementType].totalQuantity += m.quantity;
        });

        return {
            summary: {
                totalMovements,
                dateRange: { startDate, endDate }
            },
            byType,
            movements: movements.map(m => ({
                itemCode: m.itemCode,
                itemName: m.itemName,
                movementType: m.movementType,
                quantity: m.quantity,
                previousQuantity: m.previousQuantity,
                newQuantity: m.newQuantity,
                reference: m.reference,
                notes: m.notes,
                performedBy: m.performedBy?.fullName || 'Unknown',
                createdAt: m.createdAt
            }))
        };
    }

    /**
     * Generate Financial Report
     */
    async getFinancialReport(startDate, endDate) {
        // Get sales data
        const salesFilter = {};
        if (startDate) salesFilter.saleDate = { $gte: new Date(startDate) };
        if (endDate) salesFilter.saleDate = { ...salesFilter.saleDate, $lte: new Date(endDate) };

        const sales = await Sale.find(salesFilter);

        // Get order data
        const orderFilter = {};
        if (startDate) orderFilter.orderDate = { $gte: new Date(startDate) };
        if (endDate) orderFilter.orderDate = { ...orderFilter.orderDate, $lte: new Date(endDate) };

        const orders = await Order.find(orderFilter);

        // Calculate metrics
        const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalPaid = sales.reduce((sum, s) => sum + s.amountPaid, 0);
        const outstandingBalance = sales.reduce((sum, s) => sum + s.balanceDue, 0);

        // Inventory value
        const inventoryItems = await InventoryItem.find({ isActive: true });
        const inventoryValue = inventoryItems.reduce(
            (sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 
            0
        );

        return {
            summary: {
                totalRevenue,
                totalPaid,
                outstandingBalance,
                inventoryValue,
                totalOrders: orders.length,
                completedOrders: orders.filter(o => o.status === 'Completed').length,
                dateRange: { startDate, endDate }
            },
            revenueBreakdown: {
                byPaymentMethod: await this.getPaymentMethodBreakdown(startDate, endDate),
                daily: await this.getDailyRevenue(startDate, endDate)
            }
        };
    }

    /**
     * Helper: Get payment method breakdown
     */
    async getPaymentMethodBreakdown(startDate, endDate) {
        const filter = {};
        if (startDate) filter.saleDate = { $gte: new Date(startDate) };
        if (endDate) filter.saleDate = { ...filter.saleDate, $lte: new Date(endDate) };

        const sales = await Sale.find(filter);
        const breakdown = {};
        
        sales.forEach(sale => {
            if (sale.paymentMethod) {
                if (!breakdown[sale.paymentMethod]) {
                    breakdown[sale.paymentMethod] = { count: 0, total: 0 };
                }
                breakdown[sale.paymentMethod].count++;
                breakdown[sale.paymentMethod].total += sale.totalAmount;
            }
        });

        return breakdown;
    }

    /**
     * Helper: Get daily revenue
     */
    async getDailyRevenue(startDate, endDate) {
        const filter = {};
        if (startDate) filter.saleDate = { $gte: new Date(startDate) };
        if (endDate) filter.saleDate = { ...filter.saleDate, $lte: new Date(endDate) };

        const sales = await Sale.find(filter);
        const daily = {};

        sales.forEach(sale => {
            const date = sale.saleDate.toISOString().split('T')[0];
            if (!daily[date]) daily[date] = 0;
            daily[date] += sale.totalAmount;
        });

        return daily;
    }
}

module.exports = new ReportService();