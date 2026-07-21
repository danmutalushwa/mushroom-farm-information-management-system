const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger');

/**
 * Create notification
 */
const createNotification = async (req, res, next) => {
    try {
        const result = await NotificationService.createNotification(req.body, req.user.id);
        
        const isBroadcast = Array.isArray(result);
        const responseData = isBroadcast 
            ? { count: result.length, notifications: result }
            : { notification: result };

        res.status(201).json({
            status: 'success',
            message: isBroadcast 
                ? `Notification broadcasted successfully to ${result.length} users` 
                : 'Notification created successfully',
            data: responseData
        });
    } catch (error) {
        logger.error('Create notification error: ' + error.message);
        next(error);
    }
};

/**
 * Get all notifications for current user
 */
const getMyNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, isRead } = req.query;
        
        const result = await NotificationService.getNotificationsByUser(
            req.user.id,
            parseInt(page),
            parseInt(limit),
            { isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Notifications retrieved successfully',
            data: result.notifications,
            pagination: result.pagination,
            unreadCount: result.unreadCount
        });
    } catch (error) {
        logger.error('Get my notifications error: ' + error.message);
        next(error);
    }
};

/**
 * Get notification by ID
 */
const getNotificationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await NotificationService.getNotificationById(id);
        
        const userRoleNormalized = req.user?.role?.trim()?.toLowerCase();
        const isUserAdmin = userRoleNormalized === 'administrator' || userRoleNormalized === 'admin';
        
        if (notification.recipient.toString() !== req.user.id && !isUserAdmin) {
            return res.status(403).json({
                status: 'fail',
                message: 'You are not authorized to view this notification'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: { notification }
        });
    } catch (error) {
        logger.error('Get notification by ID error: ' + error.message);
        next(error);
    }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const checkNotification = await NotificationService.getNotificationById(id);
        const userRoleNormalized = req.user?.role?.trim()?.toLowerCase();
        const isUserAdmin = userRoleNormalized === 'administrator' || userRoleNormalized === 'admin';

        if (checkNotification.recipient.toString() !== req.user.id && !isUserAdmin) {
            return res.status(403).json({
                status: 'fail',
                message: 'You are not authorized to modify this notification'
            });
        }

        const notification = await NotificationService.markAsRead(id);
        res.status(200).json({
            status: 'success',
            message: 'Notification marked as read',
            data: { notification }
        });
    } catch (error) {
        logger.error('Mark notification as read error: ' + error.message);
        next(error);
    }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res, next) => {
    try {
        const result = await NotificationService.markAllAsRead(req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'All notifications marked as read',
            data: { updatedCount: result.modifiedCount || result.nModified || 0 }
        });
    } catch (error) {
        logger.error('Mark all notifications as read error: ' + error.message);
        next(error);
    }
};

/**
 * Delete notification
 */
const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;

        const checkNotification = await NotificationService.getNotificationById(id);
        const userRoleNormalized = req.user?.role?.trim()?.toLowerCase();
        const isUserAdmin = userRoleNormalized === 'administrator' || userRoleNormalized === 'admin';

        if (checkNotification.recipient.toString() !== req.user.id && !isUserAdmin) {
            return res.status(403).json({
                status: 'fail',
                message: 'You are not authorized to delete this notification'
            });
        }

        // FIXED: Added req.user.role parameter to align context to service execution layers
        await NotificationService.deleteNotification(id, req.user.id, req.user.role);
        
        res.status(200).json({
            status: 'success',
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        logger.error('Delete notification error: ' + error.message);
        next(error);
    }
};

/**
 * Get unread count
 */
const getUnreadCount = async (req, res, next) => {
    try {
        const count = await NotificationService.getUnreadCount(req.user.id);
        
        res.status(200).json({
            status: 'success',
            data: { unreadCount: count }
        });
    } catch (error) {
        logger.error('Get unread count error: ' + error.message);
        next(error);
    }
};

module.exports = {
    createNotification,
    getMyNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
};
