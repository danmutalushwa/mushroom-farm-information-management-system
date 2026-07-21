const mongoose = require('mongoose');
const { REPORT_TYPES } = require('../config/constants');

/**
 * Report Template Schema
 * Stores reusable report templates
 */
const ReportTemplateSchema = new mongoose.Schema({
    templateName: {
        type: String,
        required: [true, 'Template name is required'],
        unique: true,
        trim: true
    },
    templateCode: {
        type: String,
        required: [true, 'Template code is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    reportType: {
        type: String,
        required: [true, 'Report type is required'],
        enum: REPORT_TYPES
    },
    description: {
        type: String,
        default: null
    },
    config: {
        columns: [{
            name: {
                type: String,
                required: true
            },
            field: {
                type: String,
                required: true
            },
            width: {
                type: Number,
                default: null
            },
            alignment: {
                type: String,
                enum: ['left', 'center', 'right'],
                default: 'left'
            },
            format: {
                type: String,
                enum: ['text', 'number', 'currency', 'date', 'percentage'],
                default: 'text'
            },
            visible: {
                type: Boolean,
                default: true
            }
        }],
        defaultFilters: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        defaultDateRange: {
            type: String,
            enum: ['today', 'yesterday', 'week', 'month', 'quarter', 'year', 'custom'],
            default: 'month'
        },
        defaultFormat: {
            type: String,
            enum: ['PDF', 'Excel', 'JSON', 'CSV'],
            default: 'PDF'
        },
        includeSummary: {
            type: Boolean,
            default: true
        },
        includeCharts: {
            type: Boolean,
            default: false
        },
        chartTypes: [{
            type: String,
            enum: ['bar', 'line', 'pie', 'doughnut', 'area']
        }],
        sorting: [{
            field: {
                type: String,
                required: true
            },
            order: {
                type: String,
                enum: ['asc', 'desc'],
                default: 'asc'
            }
        }],
        grouping: [{
            field: {
                type: String,
                required: true
            },
            aggregate: {
                type: String,
                enum: ['count', 'sum', 'avg', 'min', 'max'],
                default: 'count'
            }
        }]
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
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Generate template code before saving
ReportTemplateSchema.pre('save', function(next) {
    if (this.isNew && !this.templateCode) {
        const prefix = this.reportType.substring(0, 3).toUpperCase();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.templateCode = `${prefix}-TMP-${random}`;
    }
    next();
});

// Index for faster queries
ReportTemplateSchema.index({ templateCode: 1 });
ReportTemplateSchema.index({ reportType: 1 });
ReportTemplateSchema.index({ isActive: 1 });
ReportTemplateSchema.index({ isDefault: 1 });

module.exports = mongoose.model('ReportTemplate', ReportTemplateSchema);