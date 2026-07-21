const mongoose = require('mongoose');

/**
 * Production Loss Schema
 * Tracks losses during mushroom production
 */
const ProductionLossSchema = new mongoose.Schema({
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
    lossDate: {
        type: Date,
        required: [true, 'Loss date is required'],
        default: Date.now
    },
    lossQuantity: {
        type: Number,
        required: [true, 'Loss quantity is required'],
        min: [0, 'Loss quantity cannot be negative']
    },
    lossReason: {
        type: String,
        enum: ['Contamination', 'Poor Growth', 'Pest Damage', 'Environmental Factors', 'Other'],
        required: [true, 'Loss reason is required']
    },
    description: {
        type: String,
        default: null
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
ProductionLossSchema.index({ batchId: 1, lossDate: -1 });

module.exports = mongoose.model('ProductionLoss', ProductionLossSchema);