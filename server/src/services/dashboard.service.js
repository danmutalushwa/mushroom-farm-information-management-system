const User = require('../models/User');  
const ProductionBatch = require('../models/ProductionBatch');
const InventoryItem = require('../models/InventoryItem');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const logger = require('../utils/logger');

/**
 * Dashboard Service
 * Handles dashboard data aggregation and analytics
 */
class DashboardService {
    /**
     * Get admin dashboard data
     */
    async getAdminDashboard() {
        const [
            totalUsers,
            activeUsers,
            totalCustomers,
            totalOrders,
            pendingOrders,
            completedOrders,
            totalSales,
            totalRevenue,
            totalProduction,
            lowStockItems,
            recentOrders,
            recentSales
        ] = await Promise.all([
            // User statistics
            this.getUserStatistics(),
            // Customer statistics
            this.getCustomerStatistics(),
            // Order statistics
            this.getOrderStatistics(),
            // Sales statistics
            this.getSalesStatistics(),
            // Production statistics
            this.getProductionStatistics(),
            // Inventory statistics
            this.getInventoryStatistics(),
            // Recent data
            Order.find({}).sort({ createdAt: -1 }).limit(5).populate('customerId', 'fullName'),
            Sale.find({}).sort({ createdAt: -1 }).limit(5).populate('customerId', 'fullName')
        ]);

        return {
            summary: {
                totalUsers: totalUsers || 0,
                activeUsers: activeUsers || 0,
                totalCustomers: totalCustomers || 0,
                totalOrders: totalOrders || 0,
                pendingOrders: pendingOrders || 0, 
                completedOrders: completedOrders || 0,
                totalSales: totalSales || 0,
                totalRevenue: totalRevenue || 0,
                totalProduction: totalProduction || 0,
                lowStockCount: lowStockItems?.length || 0
            },
            recentOrders: recentOrders || [],
            recentSales: recentSales || [],
            lowStockItems: lowStockItems || []
        };
    }
    /**
     * Get Farm Manager Dashboard
     */
    async getFarmManagerDashboard() {
        const [
            totalBatches,
            activeBatches,
            completedBatches,
            readyForHarvest,
            totalHarvest,
            totalInventoryItems,
            lowStockItems,
            totalOrders,
            pendingOrders,
            totalSales,
            totalRevenue,
            recentBatches,
            recentOrders,
            recentSales
        ]= await Promise.all([
            //Production
            ProductionBatch.countDocuments(),

            productionBatch.countDocuments({
                status: {$in: ['In Progress', 'Planned']}
            }),
            
            ProductionBatch.countDocuments({
                status: 'Completed'
            }),

            ProductionBatch.countDocuments({
                status: 'Ready for Harvest'
            }),

            ProductionBatch.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalHarvest'}
                    }
                }
            ]),

            // Inventory
            InventoryItem.countDocuments({
                isActive: true
            }),

            InventoryItem.find({
                isActive: true,
                $exper: {
                    $lte: ['$quantity', '$minimumStockLevel']
                }
            }),

            // Orders
            Order.countDocuments({
                status: 'Pending'
            }),

            // Sales
            sale.countDocuments(),

            Sale.aggregate([
                {
                    $group: {
                        _id: null,
                        total: {$sum: '$totalAmount'}
                    }
                }
            ]),

            //Recent production
            ProductionBatch.find({})
            .sort({createdAt: -1})
            .limit(5)
            .populate('createdBy','fullName'),

            // Recent Orders
            Order.find({})
                .sort({createdAt: -1})
                .limit(5)
                .populate('customerId', 'fullName'),
            
            // Recent Sales
            Sale.find({})
              .sort({createdAt: -1})
              .limit(5)
              .populate('customerId', 'fullName')
        ]);

        return {
            summary: {
                totalBatches,
                activeBatches,
                completedBatches,
                readyForHarvest,
                totalHarvest: totalHarvest[0]?.total||0,

                totalInventoryItems,
                lowStockCount: lowStockItems.length,

                totalOrders,
                pendingOrders,

                totalSales,
                totalRevenue: totalRevenue[0]?.total || 0
            },

            recentBatches: recentBatches || [],
            recentOrders: recentOrders || [],
            recentSales: recentSales || [],
            lowStockItems: lowStockItems || []
        };
    }

    /**
     * Get production supervisor dashboard
     */
    async getProductionDashboard() {
        const [
            totalBatches,
            activeBatches,
            readyForHarvest,
            totalHarvest,
            recentBatches,
            productionStats
        ] = await Promise.all([
            ProductionBatch.countDocuments(),
            ProductionBatch.countDocuments({ status: { $in: ['In Progress', 'Planned'] } }),
            ProductionBatch.countDocuments({ status: 'Ready for Harvest' }),
            ProductionBatch.aggregate([
                { $group: { _id: null, total: { $sum: '$totalHarvest' } } }
            ]),
            ProductionBatch.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('createdBy', 'fullName'),
            this.getProductionStats()
        ]);

        return {
            summary: {
                totalBatches,
                activeBatches,
                readyForHarvest,
                totalHarvest: totalHarvest[0]?.total || 0
            },
            recentBatches,
            productionStats
        };
    }

    /**
     * Get inventory officer dashboard
     */
    async getInventoryDashboard() {
        const [
            totalItems,
            lowStockItems,
            outOfStockItems,
            recentMovements,
            inventoryStats
        ] = await Promise.all([
            InventoryItem.countDocuments({ isActive: true }),
            InventoryItem.find({
                isActive: true,
                $expr: { $lte: ['$quantity', '$minimumStockLevel'] }
            }),
            InventoryItem.find({
                isActive: true,
                quantity: 0
            }),
            this.getRecentStockMovements(),
            this.getInventoryStats()
        ]);

        return {
            summary: {
                totalItems,
                lowStockCount: lowStockItems.length,
                outOfStockCount: outOfStockItems.length
            },
            lowStockItems,
            outOfStockItems,
            recentMovements,
            inventoryStats
        };
    }

    /**
     * Get sales officer dashboard
     */
    async getSalesDashboard() {
        const [
            totalOrders,
            pendingOrders,
            totalSales,
            totalRevenue,
            recentOrders,
            recentSales,
            salesStats
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ status: 'Pending' }),
            Sale.countDocuments(),
            Sale.aggregate([
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('customerId', 'fullName'),
            Sale.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('customerId', 'fullName'),
            this.getSalesStats()
        ]);

        return {
            summary: {
                totalOrders,
                pendingOrders,
                totalSales,
                totalRevenue: totalRevenue[0]?.total || 0
            },
            recentOrders,
            recentSales,
            salesStats
        };
    }

    /**
     * Get Farm Worker Dashboard
     */
    async getFarmWorkerDashboard(userId) {
        const [
            assignedTasks,
            recentActivities,
            pendingTasks,
            completedTasks
        ] = await Promise.all([
            // Get assigned production tasks
            ProductionBatch.find({
                createdBy: userId,
                status: { $in: ['In Progress', 'Planned'] }
            }).limit(5),
            // Get recent activities (using audit logs)
            this.getUserRecentActivities(userId),
            // Count pending tasks
            ProductionBatch.countDocuments({
                createdBy: userId,
                status: 'In Progress'
            }),
            // Count completed tasks
            ProductionBatch.countDocuments({
                createdBy: userId,
                status: 'Completed'
            })
        ]);

        return {
            summary: {
                assignedTasks: assignedTasks.length,
                pendingTasks,
                completedTasks,
                totalTasks: pendingTasks + completedTasks
            },
            assignedTasks,
            recentActivities
        };
    }

    /**
     * Get Customer Dashboard
     */
    async getCustomerDashboard(userId) {
        // Get user with customer details
        const user = await User.findById(userId).populate('customerId');
        const customer = user?.customerId;

        if (!customer) {
            return {
                summary: {
                    message: 'Customer profile not found'
                }
            };
        }

        const [
            recentOrders,
            orderStats,
            pendingOrders,
            completedOrders
        ] = await Promise.all([
            Order.find({ customerId: customer._id })
                .sort({ createdAt: -1 })
                .limit(5),
            Order.aggregate([
                { $match: { customerId: customer._id } },
                { $group: { 
                    _id: null, 
                    total: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                } }
            ]),
            Order.countDocuments({
                customerId: customer._id,
                status: { $in: ['Pending', 'Confirmed', 'Processing', 'Ready for Collection'] }
            }),
            Order.countDocuments({
                customerId: customer._id,
                status: 'Completed'
            })
        ]);

        return {
            customer: {
                fullName: customer.fullName,
                phoneNumber: customer.phoneNumber,
                email: customer.email,
                totalOrders: customer.totalOrders,
                totalSpent: customer.totalSpent
            },
            summary: {
                totalOrders: customer.totalOrders || 0,
                totalSpent: customer.totalSpent || 0,
                pendingOrders,
                completedOrders
            },
            recentOrders,
            orderStats: orderStats[0] || { total: 0, count: 0 }
        };
    }

    /**
     * Get user recent activities from audit logs
     */
    async getUserRecentActivities(userId) {
        const AuditLog = require('../models/AuditLog');
        return await AuditLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);
    }

    /**
     * Get user statistics
     */
    async getUserStatistics() {
        const [total, active] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true })
        ]);
        return { total, active };
    }

    /**
     * Get customer statistics
     */
    async getCustomerStatistics() {
        const [total, active] = await Promise.all([
            Customer.countDocuments(),
            Customer.countDocuments({ isActive: true })
        ]);
        return { total, active };
    }

    /**
     * Get order statistics
     */
    async getOrderStatistics() {
        const [total, pending, completed] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ status: 'Pending' }),
            Order.countDocuments({ status: 'Completed' })
        ]);
        return { total, pending, completed };
    }

    /**
     * Get sales statistics
     */
    async getSalesStatistics() {
        const [total, revenue] = await Promise.all([
            Sale.countDocuments(),
            Sale.aggregate([
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
        ]);
        return { total, revenue: revenue[0]?.total || 0 };
    }

    /**
     * Get production statistics
     */
    async getProductionStatistics() {
        const [total, harvest] = await Promise.all([
            ProductionBatch.countDocuments(),
            ProductionBatch.aggregate([
                { $group: { _id: null, total: { $sum: '$totalHarvest' } } }
            ])
        ]);
        return { total, harvest: harvest[0]?.total || 0 };
    }

    /**
     * Get inventory statistics
     */
    async getInventoryStatistics() {
        const items = await InventoryItem.find({ isActive: true });
        const lowStock = items.filter(item => item.quantity <= item.minimumStockLevel);
        const outOfStock = items.filter(item => item.quantity === 0);
        const totalValue = items.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0);
        
        return {
            totalItems: items.length,
            lowStockCount: lowStock.length,
            outOfStockCount: outOfStock.length,
            totalValue,
            lowStockItems: lowStock
        };
    }

    /**
     * Get production stats for charts
     */
    async getProductionStats() {
        const batches = await ProductionBatch.find({});
        const byStatus = {};
        const byMushroomType = {};
        
        batches.forEach(batch => {
            byStatus[batch.status] = (byStatus[batch.status] || 0) + 1;
            byMushroomType[batch.mushroomType] = (byMushroomType[batch.mushroomType] || 0) + 1;
        });

        return { byStatus, byMushroomType };
    }

    /**
     * Get recent stock movements
     */
    async getRecentStockMovements() {
        const StockMovement = require('../models/StockMovement');
        return await StockMovement.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('performedBy', 'fullName');
    }

    /**
     * Get inventory stats for charts
     */
    async getInventoryStats() {
        const items = await InventoryItem.find({ isActive: true });
        const byCategory = {};
        
        items.forEach(item => {
            byCategory[item.category] = (byCategory[item.category] || 0) + item.quantity;
        });

        return { byCategory };
    }

    /**
     * Get sales stats for charts
     */
    async getSalesStats() {
        const sales = await Sale.find({});
        const byPaymentMethod = {};
        const dailySales = {};
        
        sales.forEach(sale => {
            if (sale.paymentMethod) {
                byPaymentMethod[sale.paymentMethod] = (byPaymentMethod[sale.paymentMethod] || 0) + sale.totalAmount;
            }
            const date = sale.saleDate.toISOString().split('T')[0];
            dailySales[date] = (dailySales[date] || 0) + sale.totalAmount;
        });

        return { byPaymentMethod, dailySales };
    }
}

module.exports = new DashboardService();