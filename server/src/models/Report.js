const mongoose = require('mongoose');
const { REPORT_TYPES } = require('../config/constants');

/**
 * Report Schema
 * Stores generated reports and their configurations
 */
const ReportSchema = new mongoose.Schema({
    reportNumber: {
        type: String,
        unique: true,
        trim: true,
        uppercase: true,
        default: () => {  
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = String(date.getMonth() +1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const random = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0');
            
            return `RTP-${year}${month}${day}-${random}`;
        }
    },
    reportType: {
        type: String,
        required: [true, 'Report type is required'],
        enum: REPORT_TYPES
    },
    title: {
        type: String,
        required: [true, 'Report title is required'],
        trim: true
    },
    description: {
        type: String,
        default: null
    },
    parameters: {
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },
        filters: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        format: {
            type: String,
            enum: ['PDF', 'Excel', 'JSON', 'CSV'],
            default: 'PDF'
        }
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    summary: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    fileUrl: {
        type: String,
        default: null
    },
    filePath: {
        type: String,
        default: null
    },
    fileSize: {
        type: Number,
        default: 0
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    generatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    isDownloaded: {
        type: Boolean,
        default: false
    },
    downloadedAt: {
        type: Date,
        default: null
    },
    downloadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    notes: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Virtual for report age
ReportSchema.virtual('age').get(function() {
    if (!this.generatedAt) return 0;
    const now = new Date();
    const diffTime = Math.abs(now - this.generatedAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
});

// Index for faster queries
ReportSchema.index({ reportType: 1 });
ReportSchema.index({ generatedBy: 1 });
ReportSchema.index({ generatedAt: -1 });
ReportSchema.index({ isDeleted: 1 });

module.exports = mongoose.models.Report || mongoose.model('Report', ReportSchema);