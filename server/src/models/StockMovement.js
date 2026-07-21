const mongoose = require('mongoose');
const { STOCK_MOVEMENT_TYPES } = require('../config/constants');

/**
 * Stock Movement Schema
 * Tracks all inventory movements
 */
const StockMovementSchema = new mongoose.Schema({
    inventoryItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryItem',
        required: [true, 'Inventory item ID is required']
    },
    itemCode: {
        type: String,
        required: [true, 'Item code is required'],
        trim: true
    },
    itemName: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
    },
    movementType: {
        type: String,
        required: [true, 'Movement type is required'],
        enum: STOCK_MOVEMENT_TYPES
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0.01, 'Quantity must be greater than 0']
    },
    previousQuantity: {
        type: Number,
        required: true
    },
    newQuantity: {
        type: Number,
        required: true
    },
    reference: {
        type: String,
        default: null,
        trim: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    notes: {
        type: String,
        default: null
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
StockMovementSchema.index({ inventoryItemId: 1, createdAt: -1 });
StockMovementSchema.index({ itemCode: 1 });
StockMovementSchema.index({ movementType: 1 });
StockMovementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StockMovement', StockMovementSchema);