const ProductionBatch = require('../models/ProductionBatch');
const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger');

/**
 * Harvest Job
 * Handles automated harvest-related tasks
 */
class HarvestJob {
    /**
     * Check for batches approaching harvest date
     */
    async checkUpcomingHarvests() {
        try {
            logger.info('Running upcoming harvest check job...');
            
            const today = new Date();
            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

            // Find batches with upcoming harvest dates
            const upcomingBatches = await ProductionBatch.find({
                status: { $in: ['In Progress', 'Planned'] },
                expectedHarvestDate: { 
                    $gte: today,
                    $lte: threeDaysFromNow
                }
            }).populate('createdBy', 'fullName email');

            if (upcomingBatches.length === 0) {
                logger.info('No upcoming harvests found');
                return { processed: 0, notifications: 0 };
            }

            logger.info(`Found ${upcomingBatches.length} upcoming harvests`);

            let notificationCount = 0;
            
            for (const batch of upcomingBatches) {
                const daysUntilHarvest = Math.ceil(
                    (batch.expectedHarvestDate - today) / (1000 * 60 * 60 * 24)
                );

                const urgency = daysUntilHarvest <= 1 ? 'urgent' : 'medium';

                await NotificationService.createNotification({
                    type: 'Upcoming Harvest',
                    title: `Harvest Reminder: ${batch.batchNumber}`,
                    message: `Batch ${batch.batchNumber} (${batch.mushroomType}) is expected to be ready for harvest in ${daysUntilHarvest} day(s). Prepare for harvesting activities.`,
                    priority: urgency,
                    category: 'reminder',
                    recipientRole: ['Administrator', 'Production Supervisor'],
                    link: `/production/${batch._id}`,
                    referenceId: batch._id,
                    referenceType: 'ProductionBatch',
                    metadata: {
                        batchNumber: batch.batchNumber,
                        mushroomType: batch.mushroomType,
                        expectedHarvestDate: batch.expectedHarvestDate,
                        daysUntilHarvest: daysUntilHarvest,
                        productionRoom: batch.productionRoom,
                        spawnQuantity: batch.spawnQuantity
                    }
                });
                
                notificationCount++;
            }

            logger.info(`Upcoming harvest check completed. Sent ${notificationCount} notifications`);
            
            return {
                processed: upcomingBatches.length,
                notifications: notificationCount
            };
        } catch (error) {
            logger.error('Upcoming harvest check job error:', error.message);
            throw error;
        }
    }

    /**
     * Check for overdue harvests
     */
    async checkOverdueHarvests() {
        try {
            logger.info('Running overdue harvest check job...');
            
            const today = new Date();

            // Find batches with overdue harvest dates
            const overdueBatches = await ProductionBatch.find({
                status: { $in: ['In Progress', 'Ready for Harvest'] },
                expectedHarvestDate: { $lt: today }
            }).populate('createdBy', 'fullName email');

            if (overdueBatches.length === 0) {
                logger.info('No overdue harvests found');
                return { processed: 0, notifications: 0 };
            }

            logger.info(`Found ${overdueBatches.length} overdue harvests`);

            let notificationCount = 0;
            
            for (const batch of overdueBatches) {
                const daysOverdue = Math.ceil(
                    (today - batch.expectedHarvestDate) / (1000 * 60 * 60 * 24)
                );

                await NotificationService.createNotification({
                    type: 'System Alert',
                    title: `OVERDUE HARVEST: ${batch.batchNumber}`,
                    message: `Batch ${batch.batchNumber} (${batch.mushroomType}) is ${daysOverdue} day(s) overdue for harvest. Immediate action required.`,
                    priority: 'urgent',
                    category: 'alert',
                    recipientRole: ['Administrator', 'Production Supervisor'],
                    link: `/production/${batch._id}`,
                    referenceId: batch._id,
                    referenceType: 'ProductionBatch',
                    metadata: {
                        batchNumber: batch.batchNumber,
                        mushroomType: batch.mushroomType,
                        expectedHarvestDate: batch.expectedHarvestDate,
                        daysOverdue: daysOverdue,
                        productionRoom: batch.productionRoom
                    }
                });
                
                notificationCount++;
            }

            logger.info(`Overdue harvest check completed. Sent ${notificationCount} notifications`);
            
            return {
                processed: overdueBatches.length,
                notifications: notificationCount
            };
        } catch (error) {
            logger.error('Overdue harvest check job error:', error.message);
            throw error;
        }
    }

    /**
     * Auto-update batch statuses
     */
    async autoUpdateBatchStatuses() {
        try {
            logger.info('Running auto-update batch statuses job...');
            
            const batches = await ProductionBatch.find({
                status: { $nin: ['Completed', 'Cancelled'] }
            });

            let updatedCount = 0;
            
            for (const batch of batches) {
                const oldStatus = batch.status;
                const newStatus = batch.updateStatus();
                
                if (oldStatus !== newStatus) {
                    await batch.save();
                    updatedCount++;
                    
                    logger.info(`Batch status updated: ${batch.batchNumber}`, {
                        oldStatus,
                        newStatus,
                        batchId: batch._id
                    });
                }
            }

            logger.info(`Auto-update completed. Updated ${updatedCount} batches`);
            
            return {
                processed: batches.length,
                updated: updatedCount
            };
        } catch (error) {
            logger.error('Auto-update batch statuses error:', error.message);
            throw error;
        }
    }
}

module.exports = new HarvestJob();