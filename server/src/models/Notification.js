const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../config/constants');

/**
 * Notification Schema
 * Stores system notifications for users
 */
const NotificationSchema = new mongoose.Schema({
    notificationNumber: {
        type: String,
        required: [true, 'Notification number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    type: {
        type: String,
        required: [true, 'Notification type is required'],
        enum: NOTIFICATION_TYPES
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient is required']
    },
    recipientRole: {
        type: String,
        default: null
    },
    recipientEmail: {
        type: String,
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    isEmailed: {
        type: Boolean,
        default: false
    },
    emailedAt: {
        type: Date,
        default: null
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    category: {
        type: String,
        enum: ['alert', 'reminder', 'info', 'warning', 'success'],
        default: 'info'
    },
    link: {
        type: String,
        default: null
    },
    actionUrl: {
        type: String,
        default: null
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    referenceType: {
        type: String,
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    expiresAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Mark as read
NotificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this;
};

// Check if notification is expired
NotificationSchema.virtual('isExpired').get(function() {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

// Index for faster queries
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);