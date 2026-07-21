const mongoose = require('mongoose');
const { ROLES, ROLE_PERMISSIONS } = require('../config/roles');

/**
 * Role Schema
 * Defines system roles and their permissions
 */
const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        enum: Object.values(ROLES),
        trim: true
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true
    },
    description: {
        type: String,
        default: null
    },
    permissions: {
        canManageUsers: { type: Boolean, default: false },
        canManageRoles: { type: Boolean, default: false },
        canManageProduction: { type: Boolean, default: false },
        canManageInventory: { type: Boolean, default: false },
        canManageCustomers: { type: Boolean, default: false },
        canManageOrders: { type: Boolean, default: false },
        canManageSales: { type: Boolean, default: false },
        canManageReports: { type: Boolean, default: false },
        canManageSettings: { type: Boolean, default: false },
        canViewAuditLogs: { type: Boolean, default: false },
        canManageNotifications: { type: Boolean, default: false },
        canManageSystem: { type: Boolean, default: false },
        canViewAllData: { type: Boolean, default: false }
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries
RoleSchema.index({ name: 1 });
RoleSchema.index({ isActive: 1 });

module.exports = mongoose.model('Role', RoleSchema);