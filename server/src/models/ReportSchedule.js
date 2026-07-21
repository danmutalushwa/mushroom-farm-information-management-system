const mongoose = require('mongoose');
const { REPORT_TYPES } = require('../config/constants');

/**
 * Report Schedule Schema
 * Stores scheduled report generation configurations
 */
const ReportScheduleSchema = new mongoose.Schema({
    scheduleName: {
        type: String,
        required: [true, 'Schedule name is required'],
        trim: true
    },
    scheduleCode: {
        type: String,
        required: [true, 'Schedule code is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    reportType: {
        type: String,
        required: [true, 'Report type is required'],
        enum: REPORT_TYPES
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReportTemplate',
        default: null
    },
    frequency: {
        type: String,
        required: [true, 'Frequency is required'],
        enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly', 'custom']
    },
    interval: {
        type: Number,
        default: 1
    },
    intervalUnit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        default: 'days'
    },
    scheduleTime: {
        type: String, // HH:MM format
        required: [true, 'Schedule time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
    },
    scheduleDays: {
        type: [Number], // 0 = Sunday, 1 = Monday, etc.
        default: []
    },
    scheduleDate: {
        type: Number, // Day of month (1-31)
        default: null
    },
    timezone: {
        type: String,
        default: 'Africa/Kigali'
    },
    recipients: [{
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        name: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    format: {
        type: String,
        enum: ['PDF', 'Excel', 'JSON', 'CSV'],
        default: 'PDF'
    },
    parameters: {
        startDateOffset: {
            type: Number, // days to subtract from current date
            default: 30
        },
        endDateOffset: {
            type: Number,
            default: 0
        },
        filters: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastRunAt: {
        type: Date,
        default: null
    },
    lastRunStatus: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: null
    },
    lastRunError: {
        type: String,
        default: null
    },
    nextRunAt: {
        type: Date,
        default: null
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
    totalRuns: {
        type: Number,
        default: 0
    },
    successfulRuns: {
        type: Number,
        default: 0
    },
    failedRuns: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Generate schedule code before saving
ReportScheduleSchema.pre('save', function(next) {
    if (this.isNew && !this.scheduleCode) {
        const prefix = this.reportType.substring(0, 3).toUpperCase();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.scheduleCode = `${prefix}-SCH-${random}`;
    }
    next();
});

// Calculate next run date
ReportScheduleSchema.methods.calculateNextRun = function() {
    const now = new Date();
    let nextRun = new Date(now);
    
    // Parse schedule time
    const [hours, minutes] = this.scheduleTime.split(':').map(Number);
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, add days based on frequency
    if (nextRun <= now) {
        switch (this.frequency) {
            case 'daily':
                nextRun.setDate(nextRun.getDate() + 1);
                break;
            case 'weekly':
                nextRun.setDate(nextRun.getDate() + 7);
                break;
            case 'bi-weekly':
                nextRun.setDate(nextRun.getDate() + 14);
                break;
            case 'monthly':
                nextRun.setMonth(nextRun.getMonth() + 1);
                break;
            case 'quarterly':
                nextRun.setMonth(nextRun.getMonth() + 3);
                break;
            case 'yearly':
                nextRun.setFullYear(nextRun.getFullYear() + 1);
                break;
            case 'custom':
                if (this.intervalUnit === 'days') {
                    nextRun.setDate(nextRun.getDate() + this.interval);
                } else if (this.intervalUnit === 'weeks') {
                    nextRun.setDate(nextRun.getDate() + (this.interval * 7));
                } else if (this.intervalUnit === 'months') {
                    nextRun.setMonth(nextRun.getMonth() + this.interval);
                }
                break;
        }
    }
    
    this.nextRunAt = nextRun;
    return nextRun;
};

// Index for faster queries
ReportScheduleSchema.index({ scheduleCode: 1 });
ReportScheduleSchema.index({ reportType: 1 });
ReportScheduleSchema.index({ isActive: 1 });
ReportScheduleSchema.index({ nextRunAt: 1 });

module.exports = mongoose.model('ReportSchedule', ReportScheduleSchema);