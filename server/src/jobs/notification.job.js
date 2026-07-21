const Notification = require('../models/Notification');
const EmailService = require('../services/email.service');
const logger = require('../utils/logger');

/**
 * Notification Job
 * Handles automated notification tasks
 */
class NotificationJob {
    /**
     * Send pending email notifications
     */
    async sendPendingEmails() {
        try {
            logger.info('Running pending emails job...');
            
            // Find notifications that need to be emailed
            const pendingNotifications = await Notification.find({
                isEmailed: false,
                isRead: false,
                createdAt: { $exists: true }
            }).populate('recipient', 'email fullName');

            if (pendingNotifications.length === 0) {
                logger.info('No pending emails to send');
                return { processed: 0, sent: 0 };
            }

            logger.info(`Found ${pendingNotifications.length} pending emails`);

            let sentCount = 0;
            
            for (const notification of pendingNotifications) {
                try {
                    // Send email
                    await EmailService.sendNotificationEmail(
                        notification.recipient.email,
                        notification.recipient.fullName,
                        notification.title,
                        notification.message,
                        notification.link || null
                    );

                    // Mark as emailed
                    notification.isEmailed = true;
                    notification.emailedAt = new Date();
                    await notification.save();
                    
                    sentCount++;
                } catch (error) {
                    logger.error(`Failed to send email for notification ${notification._id}:`, error.message);
                }
            }

            logger.info(`Pending emails job completed. Sent ${sentCount} emails`);
            
            return {
                processed: pendingNotifications.length,
                sent: sentCount
            };
        } catch (error) {
            logger.error('Send pending emails error:', error.message);
            throw error;
        }
    }

    /**
     * Clean old notifications
     */
    async cleanOldNotifications(daysToKeep = 30) {
        try {
            logger.info(`Running clean old notifications job (keeping ${daysToKeep} days)...`);
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            // Delete read notifications older than cutoff
            const result = await Notification.deleteMany({
                isRead: true,
                createdAt: { $lt: cutoffDate }
            });

            logger.info(`Cleaned ${result.deletedCount} old notifications`);
            
            return {
                deleted: result.deletedCount
            };
        } catch (error) {
            logger.error('Clean old notifications error:', error.message);
            throw error;
        }
    }

    /**
     * Send daily notification digest
     */
    async sendDailyDigest() {
        try {
            logger.info('Running daily digest job...');
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Get notifications from today
            const todayNotifications = await Notification.find({
                createdAt: { $gte: today, $lt: tomorrow },
                isRead: false
            }).populate('recipient', 'email fullName');

            if (todayNotifications.length === 0) {
                logger.info('No notifications for daily digest');
                return { processed: 0 };
            }

            // Group by recipient
            const groupedByRecipient = {};
            todayNotifications.forEach(notification => {
                const key = notification.recipient._id.toString();
                if (!groupedByRecipient[key]) {
                    groupedByRecipient[key] = {
                        recipient: notification.recipient,
                        notifications: []
                    };
                }
                groupedByRecipient[key].notifications.push(notification);
            });

            // Send digest emails
            let sentCount = 0;
            
            for (const key of Object.keys(groupedByRecipient)) {
                const group = groupedByRecipient[key];
                try {
                    await EmailService.sendDigestEmail(
                        group.recipient.email,
                        group.recipient.fullName,
                        group.notifications
                    );
                    sentCount++;
                } catch (error) {
                    logger.error(`Failed to send digest email to ${group.recipient.email}:`, error.message);
                }
            }

            logger.info(`Daily digest job completed. Sent ${sentCount} digest emails`);
            
            return {
                processed: todayNotifications.length,
                sent: sentCount
            };
        } catch (error) {
            logger.error('Daily digest job error:', error.message);
            throw error;
        }
    }
}

module.exports = new NotificationJob();