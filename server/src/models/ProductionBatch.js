const mongoose = require('mongoose');
const { MUSHROOM_TYPES, PRODUCTION_STATUS } = require('../config/constants');
const { generateBatchNumber } = require('../utils/helpers');

/**
 * Production Batch Schema
 * Tracks mushroom production batches from planning to harvest
 */
const ProductionBatchSchema = new mongoose.Schema({
    batchNumber: {
        type: String,
        required: [true, 'Batch number is required'],
        unique: true,
        trim: true,
        uppercase: true,
        default: generateBatchNumber
    },
    mushroomType: {
        type: String,
        required: [true, 'Mushroom type is required'],
        enum: MUSHROOM_TYPES
    },
    spawnType: {
        type: String,
        required: [true, 'Spawn type is required'],
        trim: true
    },
    productionRoom: {
        type: String,
        required: [true, 'Production room is required'],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        default: Date.now
    },
    expectedHarvestDate: {
        type: Date,
        required: [true, 'Expected harvest date is required']
    },
    actualHarvestDate: {
        type: Date,
        default: null
    },
    spawnQuantity: {
        type: Number,
        required: [true, 'Spawn quantity is required'],
        min: [0, 'Spawn quantity cannot be negative']
    },
    spawnUnit: {
        type: String,
        default: 'kg'
    },
    totalHarvest: {
        type: Number,
        default: 0,
        min: 0
    },
    harvestUnit: {
        type: String,
        default: 'kg'
    },
    productionLoss: {
        type: Number,
        default: 0,
        min: 0
    },
    lossReasons: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: PRODUCTION_STATUS,
        default: 'Planned'
    },
    notes: {
        type: String,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    harvests: [{
        harvestDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        quantity: {
            type: Number,
            required: true,
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
        }
    }]
}, {
    timestamps: true
});

/**
 * Update status based on dates and harvests
 */
ProductionBatchSchema.methods.updateStatus = function() {
    const now = new Date();
    
    // If cancelled or completed, don't change
    if (this.status === 'Cancelled' || this.status === 'Completed') {
        return this.status;
    }
    
    // Check if all harvests are done
    if (this.actualHarvestDate && this.totalHarvest > 0) {
        this.status = 'Completed';
        return this.status;
    }
    
    // Check if ready for harvest
    if (this.expectedHarvestDate && this.expectedHarvestDate <= now) {
        this.status = 'Ready for Harvest';
        return this.status;
    }
    
    // Check if in progress
    if (this.startDate && this.startDate <= now) {
        this.status = 'In Progress';
        return this.status;
    }
    
    this.status = 'Planned';
    return this.status;
};

/**
 * Add harvest to batch and update totals
 */
ProductionBatchSchema.methods.addHarvest = function(harvestData) {
    const { quantity, grade, qualityRemarks, recordedBy } = harvestData;
    
    this.harvests.push({
        harvestDate: new Date(),
        quantity,
        grade: grade || 'A',
        qualityRemarks: qualityRemarks || null,
        recordedBy
    });
    
    // Update total harvest
    this.totalHarvest += quantity;
    
    // Update status
    this.updateStatus();
    
    return this;
};

/**
 * Calculate yield efficiency
 */
ProductionBatchSchema.methods.getYieldEfficiency = function() {
    if (this.spawnQuantity === 0) return 0;
    return (this.totalHarvest / this.spawnQuantity) * 100;
};

module.exports = mongoose.model('ProductionBatch', ProductionBatchSchema);