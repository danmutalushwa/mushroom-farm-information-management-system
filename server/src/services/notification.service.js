const Notification = require('../models/Notification');
const User = require('../models/User'); // Required to pull user IDs during role broadcasts
const logger = require('../utils/logger');

// Helper function to generate unique sequential serial codes
const generateNotificationNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `NOT-${year}${month}${day}-${random}`;
}; 

class NotificationService {
    /**
     * Create a system notification
     */
    async createNotification(notificationData, createdByUserId) {
        try {
            const payload = { 
                ...notificationData, 
                createdBy: createdByUserId 
            };

            // 1. ROLE-BASED BROADCAST PIPELINE
            if (payload.recipientRole && (!payload.recipient || payload.recipient === 'all')) {
                const rolesToNotify = Array.isArray(payload.recipientRole) 
                    ? payload.recipientRole 
                    : [payload.recipientRole];

                // Find matching active user IDs across the farm
                const targetUsers = await User.find({ 
                    role: { $in: rolesToNotify },
                    isActive: true 
                }).select('_id email role');

                if (targetUsers.length === 0) {
                    throw new Error(`No active users found matching roles: ${rolesToNotify.join(', ')}`);
                }

                // Create a separate notification document for each matching user concurrently
                const creationPromises = targetUsers.map(user => {
                    return Notification.create({
                        notificationNumber: generateNotificationNumber(),
                        type: payload.type,
                        title: payload.title,
                        message: payload.message,
                        recipient: user._id,
                        recipientRole: user.role,
                        recipientEmail: user.email || null,
                        createdBy: payload.createdBy,
                        priority: payload.priority || 'medium',
                        category: payload.category || 'info',
                        link: payload.link || null,
                        actionUrl: payload.actionUrl || null,
                        referenceId: payload.referenceId || null,
                        referenceType: payload.referenceType || null,
                        metadata: payload.metadata || {},
                        expiresAt: payload.expiresAt || null
                    });
                });

                const createdNotifications = await Promise.all(creationPromises);
                logger.info(`Broadcasted ${createdNotifications.length} notifications to roles: ${rolesToNotify.join(', ')}`);
                
                return createdNotifications;
            }

            // 2. STANDARD SINGLE RECIPIENT PIPELINE
            if (!payload.type || !payload.title || !payload.message || !payload.recipient || !payload.createdBy) {
                throw new Error('Missing required fields: type, title, message, recipient, and createdBy are mandatory.');
            }

            const notification = await Notification.create({
                notificationNumber: generateNotificationNumber(),
                type: payload.type,
                title: payload.title,
                message: payload.message,
                recipient: payload.recipient,
                recipientRole: payload.recipientRole || null,
                recipientEmail: payload.recipientEmail || null,
                createdBy: payload.createdBy,
                priority: payload.priority || 'medium',
                category: payload.category || 'info',
                link: payload.link || null,
                actionUrl: payload.actionUrl || null,
                referenceId: payload.referenceId || null,
                referenceType: payload.referenceType || null,
                metadata: payload.metadata || {},
                expiresAt: payload.expiresAt || null
            });

            logger.info(`Notification ${notification.notificationNumber} created successfully for recipient: ${payload.recipient}`);
            return notification;
        } catch (error) {
            logger.error(`Error in NotificationService.createNotification: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get all notifications for current user with unified filters
     */
    async getNotificationsByUser(userId, page, limit, filters = {}) {
        try {
            const skip = (page - 1) * limit;
            const query = { 
                recipient: userId, 
                isDeleted: false,
                $or: [
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } }
                ]
            };

            if (filters.isRead !== undefined) {
                query.isRead = filters.isRead;
            }

            const [notifications, total, unreadCount] = await Promise.all([
                Notification.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Notification.countDocuments(query),
                Notification.countDocuments({ recipient: userId, isRead: false, isDeleted: false })
            ]);

            return {
                notifications,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                },
                unreadCount
            };
        } catch (error) {
            logger.error(`Error in NotificationService.getNotificationsByUser: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get single notification by ID
     */
    async getNotificationById(id) {
        try {
            const notification = await Notification.findOne({ _id: id, isDeleted: false });
            if (!notification) throw new Error('Notification not found');
            return notification;
        } catch (error) {
            logger.error(`Error in NotificationService.getNotificationById: ${error.message}`);
            throw error;
        }
    }

    /**
     * Mark an explicit notification as read using the schema custom method
     */
    async markAsRead(id) {
        try {
            const notification = await Notification.findOne({ _id: id, isDeleted: false });
            if (!notification) throw new Error('Notification not found');

            notification.markAsRead(); // Invokes your custom model method
            await notification.save();
            return notification;
        } catch (error) {
            logger.error(`Error in NotificationService.markAsRead: ${error.message}`);
            throw error;
        }
    }

    /**
     * Mark all user notifications as read
     */
    async markAllAsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { recipient: userId, isRead: false, isDeleted: false },
                { $set: { isRead: true, readAt: new Date() } }
            );
            return result;
        } catch (error) {
            logger.error(`Error in NotificationService.markAllAsRead: ${error.message}`);
            throw error;
        }
    }

    /**
     * Soft delete notification
     * FIXED: Correct property definitions alignment applied smoothly
     */
    async deleteNotification(id, userId, userRole) {
        try {
            const query = { _id: id, isDeleted: false };
            
            // Secure gate: if the user is not an Admin, they can only delete their own documents
            if (userRole !== 'Administrator') {
                query.recipient = userId;
            }

            const notification = await Notification.findOneAndUpdate(
                query,
                { $set: { isDeleted: true, deletedAt: new Date() } },
                { new: true }
            );

            if (!notification) {
                throw new Error('Notification not found or unauthorized');
            }

            logger.info(`Notification ${notification.notificationNumber} soft-deleted successfully.`);
            return notification;
        } catch (error) {
            logger.error(`Error in NotificationService.deleteNotification: ${error.message}`);
            throw error;
        }
    }

    /**
     * Fast retrieval of unread items count
     * FIXED: Added missing tracking component handler to avoid controller crashes
     */
    async getUnreadCount(userId) {
        try {
            return await Notification.countDocuments({ recipient: userId, isRead: false, isDeleted: false });
        } catch (error) {
            logger.error(`Error in NotificationService.getUnreadCount: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new NotificationService();
