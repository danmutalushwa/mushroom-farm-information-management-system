const InventoryItem = require('../models/InventoryItem');
const StockMovement = require('../models/StockMovement');
const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger');

/**
 * Inventory Job
 * Handles automated inventory tasks
 */
class InventoryJob {
    /**
     * Check low stock items and send notifications
     */
    async checkLowStock() {
        try {
            logger.info('Running low stock check job...');
            
            // Find items below minimum stock level
            const lowStockItems = await InventoryItem.find({
                isActive: true,
                $expr: { $lte: ['$quantity', '$minimumStockLevel'] }
            }).populate('createdBy', 'fullName email');

            if (lowStockItems.length === 0) {
                logger.info('No low stock items found');
                return { processed: 0, notifications: 0 };
            }

            logger.info(`Found ${lowStockItems.length} low stock items`);

            // Send notifications for each low stock item
            let notificationCount = 0;
            
            for (const item of lowStockItems) {
                const shortfall = item.minimumStockLevel - item.quantity;
                
                // Create notification for inventory officers and admin
                await NotificationService.createNotification({
                    type: 'Low Stock',
                    title: `Low Stock Alert: ${item.itemName}`,
                    message: `${item.itemName} (${item.itemCode}) is below minimum stock level. Current: ${item.quantity} ${item.unitOfMeasurement}, Minimum: ${item.minimumStockLevel} ${item.unitOfMeasurement}. Shortfall: ${shortfall} ${item.unitOfMeasurement}.`,
                    priority: 'high',
                    category: 'alert',
                    recipientRole: ['Administrator', 'Inventory Officer'],
                    link: `/inventory/${item._id}`,
                    referenceId: item._id,
                    referenceType: 'InventoryItem',
                    metadata: {
                        itemCode: item.itemCode,
                        currentQuantity: item.quantity,
                        minimumStockLevel: item.minimumStockLevel,
                        shortfall: shortfall,
                        unit: item.unitOfMeasurement
                    }
                });
                
                notificationCount++;
            }

            logger.info(`Low stock check completed. Sent ${notificationCount} notifications`);
            
            return {
                processed: lowStockItems.length,
                notifications: notificationCount
            };
        } catch (error) {
            logger.error('Low stock check job error:', error.message);
            throw error;
        }
    }

    /**
     * Check for items that are out of stock
     */
    async checkOutOfStock() {
        try {
            logger.info('Running out of stock check job...');
            
            const outOfStockItems = await InventoryItem.find({
                isActive: true,
                quantity: 0
            });

            if (outOfStockItems.length === 0) {
                logger.info('No out of stock items found');
                return { processed: 0 };
            }

            logger.info(`Found ${outOfStockItems.length} out of stock items`);

            // Send urgent notifications
            let notificationCount = 0;
            
            for (const item of outOfStockItems) {
                await NotificationService.createNotification({
                    type: 'System Alert',
                    title: `OUT OF STOCK: ${item.itemName}`,
                    message: `${item.itemName} (${item.itemCode}) is completely out of stock. Immediate action required.`,
                    priority: 'urgent',
                    category: 'alert',
                    recipientRole: ['Administrator', 'Inventory Officer'],
                    link: `/inventory/${item._id}`,
                    referenceId: item._id,
                    referenceType: 'InventoryItem',
                    metadata: {
                        itemCode: item.itemCode,
                        currentQuantity: 0,
                        minimumStockLevel: item.minimumStockLevel
                    }
                });
                notificationCount++;
            }

            return {
                processed: outOfStockItems.length,
                notifications: notificationCount
            };
        } catch (error) {
            logger.error('Out of stock check job error:', error.message);
            throw error;
        }
    }

    /**
     * Generate daily inventory summary
     */
    async generateDailySummary() {
        try {
            logger.info('Generating daily inventory summary...');
            
            const items = await InventoryItem.find({ isActive: true });
            
            const summary = {
                totalItems: items.length,
                byCategory: {},
                totalValue: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                items: []
            };

            items.forEach(item => {
                // Group by category
                if (!summary.byCategory[item.category]) {
                    summary.byCategory[item.category] = {
                        count: 0,
                        totalQuantity: 0,
                        totalValue: 0
                    };
                }
                summary.byCategory[item.category].count++;
                summary.byCategory[item.category].totalQuantity += item.quantity;
                summary.byCategory[item.category].totalValue += item.quantity * (item.unitPrice || 0);

                // Total value
                summary.totalValue += item.quantity * (item.unitPrice || 0);

                // Stock status
                if (item.quantity === 0) {
                    summary.outOfStockCount++;
                } else if (item.quantity <= item.minimumStockLevel) {
                    summary.lowStockCount++;
                }

                // Item summary
                summary.items.push({
                    itemCode: item.itemCode,
                    itemName: item.itemName,
                    category: item.category,
                    quantity: item.quantity,
                    stockStatus: item.stockStatus,
                    value: item.quantity * (item.unitPrice || 0)
                });
            });

            // Create summary notification for admin
            await NotificationService.createNotification({
                type: 'System Alert',
                title: 'Daily Inventory Summary',
                message: `Total Items: ${summary.totalItems}, Low Stock: ${summary.lowStockCount}, Out of Stock: ${summary.outOfStockCount}, Total Value: ${summary.totalValue.toFixed(2)} RWF`,
                priority: 'low',
                category: 'info',
                recipientRole: ['Administrator', 'Inventory Officer'],
                link: '/reports/inventory',
                metadata: summary
            });

            logger.info('Daily inventory summary generated successfully');
            
            return summary;
        } catch (error) {
            logger.error('Generate daily summary error:', error.message);
            throw error;
        }
    }
}

module.exports = new InventoryJob();