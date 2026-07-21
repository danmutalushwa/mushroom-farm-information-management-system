const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../config/constants');
const { generateOrderNumber } = require('../utils/helpers');

/**
 * Order Schema
 * Tracks customer orders from creation to completion
 */
const OrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: [true, 'Order number is required'],
        unique: true,
        trim: true,
        uppercase: true,
        default: generateOrderNumber
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer ID is required']
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    customerPhone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true
    },
    items: [{
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
    }],
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative']
    },
    tax: {
        type: Number,
        default: 0,
        min: [0, 'Tax cannot be negative']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: ORDER_STATUS,
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    expectedDeliveryDate: {
        type: Date,
        default: null
    },
    actualDeliveryDate: {
        type: Date,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Partially Paid', 'Unpaid'],
        default: 'Unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Mobile Money', 'Bank Transfer', 'Credit/Debit Card'],
        default: null
    },
    deliveryAddress: {
        type: String,
        default: null
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
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancellationReason: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Calculate totals before saving
OrderSchema.pre('save', function() {
    if (this.isModified('items') || this.isNew) {
        // Calculate subtotal
        this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
        
        // Calculate total amount
        this.totalAmount = this.subtotal + this.tax - this.discount;
        
        // Ensure total is not negative
        if (this.totalAmount < 0) {
            this.totalAmount = 0;
        }
    }
    
});

// Virtual for total items
OrderSchema.virtual('totalItems').get(function() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for is complete
OrderSchema.virtual('isComplete').get(function() {
    return this.status === 'Completed' || this.status === 'Cancelled';
});

// Index for faster queries
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);