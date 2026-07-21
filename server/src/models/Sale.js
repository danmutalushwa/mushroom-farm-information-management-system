const mongoose = require('mongoose');
const { PAYMENT_METHODS, PAYMENT_STATUS } = require('../config/constants');

/**
 * Sale Schema
 * Tracks completed sales transactions
 */
const SaleSchema = new mongoose.Schema({
    saleNumber: {
        type: String,
        required: [true, 'Sale number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order ID is required']
    },
    orderNumber: {
        type: String,
        required: [true, 'Order number is required'],
        trim: true
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
    amountPaid: {
        type: Number,
        default: 0,
        min: [0, 'Amount paid cannot be negative']
    },
    balanceDue: {
        type: Number,
        default: 0,
        min: [0, 'Balance due cannot be negative']
    },
    paymentStatus: {
        type: String,
        enum: PAYMENT_STATUS,
        default: 'Pending' // Fixed: Set default to 'Pending' to match allowed enum configuration
    },
    paymentMethod: {
        type: String,
        enum: PAYMENT_METHODS,
        default: null
    },
    saleDate: {
        type: Date,
        required: true,
        default: Date.now
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

// Pre-save hook to auto-generate the saleNumber and calculate balances
SaleSchema.pre('validate', async function() {
    if (this.isNew && !this.saleNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.saleNumber = `SALE-${year}${month}${day}-${random}`;
    }
    
    // Calculate balance due
    this.balanceDue = this.totalAmount - this.amountPaid;
    if (this.balanceDue < 0) this.balanceDue = 0;
    
    // Update payment status based on amount paid
    if (this.amountPaid >= this.totalAmount) {
        this.paymentStatus = 'Paid';
    } else if (this.amountPaid > 0) {
        this.paymentStatus = 'Partially Paid';
    } else {
        this.paymentStatus = 'Pending'; // Fixed: Changed 'Unpaid' to 'Pending' to match enum constraints
    }
});

// Virtual for is fully paid
SaleSchema.virtual('isFullyPaid').get(function() {
    return this.amountPaid >= this.totalAmount;
});

// Virtual for remaining balance
SaleSchema.virtual('remainingBalance').get(function() {
    return Math.max(0, this.totalAmount - this.amountPaid);
});

// Index for faster queries
SaleSchema.index({ orderId: 1 });
SaleSchema.index({ customerId: 1 });
SaleSchema.index({ saleDate: -1 });
SaleSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Sale', SaleSchema);
