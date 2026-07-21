const mongoose = require('mongoose');

/**
 * Harvest Schema
 * Individual harvest records for a production batch
 */
const HarvestSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductionBatch',
        required: [true, 'Batch ID is required']
    },
    batchNumber: {
        type: String,
        required: [true, 'Batch number is required'],
        trim: true
    },
    harvestDate: {
        type: Date,
        required: [true, 'Harvest date is required'],
        default: Date.now
    },
    quantity: {
        type: Number,
        required: [true, 'Harvest quantity is required'],
        min: [0, 'Harvest quantity cannot be negative']
    },
    grade: {
        type: String,
        enum: ['A', 'B', 'C'],
        default: 'A'
    },
    qualityRemarks: {
        type: String,
        default: null
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
HarvestSchema.index({ batchId: 1, harvestDate: -1 });
HarvestSchema.index({ batchNumber: 1 });

module.exports = mongoose.model('Harvest', HarvestSchema);