const mongoose = require('mongoose');

/**
 * Order Item Schema
 * Individual items within an order (used as embedded docs in Order)
 * This is a separate model for reference if needed
 */
const OrderItemSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryItem',
        required: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    productCode: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
        type: Number,
        required: true,
        min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, 'Total price cannot be negative']
    },
    notes: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
OrderItemSchema.index({ orderId: 1 });
OrderItemSchema.index({ productId: 1 });

module.exports = mongoose.model('OrderItem', OrderItemSchema);