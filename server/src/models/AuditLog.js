const mongoose = require('mongoose');

/**
 * Audit Log Schema
 * Tracks all user activities and system events
 */
const AuditLogSchema = new mongoose.Schema({
    logNumber: {
        type: String,
        required: [true, 'Log number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    userRole: {
        type: String,
        required: true
    },
    userFullName: {
        type: String,
        required: true,
        trim: true
    },
    action: {
        type: String,
        required: true,
        trim: true
    },
    module: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        required: true
    },
    endpoint: {
        type: String,
        required: true,
        trim: true
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    requestBody: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    requestQuery: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    requestParams: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    responseStatus: {
        type: Number,
        default: null
    },
    responseTime: {
        type: Number, // in milliseconds
        default: null
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'error'],
        required: true,
        default: 'success'
    },
    errorMessage: {
        type: String,
        default: null
    },
    resourceId: {
        type: String,
        default: null
    },
    resourceType: {
        type: String,
        default: null
    },
    changes: {
        before: { type: mongoose.Schema.Types.Mixed, default: null },
        after: { type: mongoose.Schema.Types.Mixed, default: null }
    },
    sessionId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Generate log number before saving
AuditLogSchema.pre('save', function(next) {
    if (this.isNew && !this.logNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.logNumber = `LOG-${year}${month}${day}-${random}`;
    }
    next();
});

// Index for faster queries
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ module: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ status: 1 });
AuditLogSchema.index({ userEmail: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);