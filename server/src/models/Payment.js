const mongoose = require('mongoose');
const { PAYMENT_METHODS, PAYMENT_STATUS } = require('../config/constants');

/**
 * Payment Schema
 * Tracks individual payments made by customers
 */
const PaymentSchema = new mongoose.Schema({
    paymentNumber: {
        type: String,
        required: [true, 'Payment number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    saleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sale',
        required: [true, 'Sale ID is required']
    },
    saleNumber: {
        type: String,
        required: [true, 'Sale number is required'],
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
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0.01, 'Payment amount must be greater than 0']
    },
    paymentMethod: {
        type: String,
        enum: PAYMENT_METHODS,
        required: [true, 'Payment method is required']
    },
    paymentStatus: {
        type: String,
        enum: PAYMENT_STATUS,
        default: 'Paid'
    },
    referenceNumber: {
        type: String,
        default: null,
        trim: true
    },
    paymentDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    notes: {
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

// Generate payment number before saving
PaymentSchema.pre('save', function(next) {
    if (this.isNew && !this.paymentNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.paymentNumber = `PAY-${year}${month}${day}-${random}`;
    }
    next();
});

// Index for faster queries
PaymentSchema.index({ saleId: 1 });
PaymentSchema.index({ customerId: 1 });
PaymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);