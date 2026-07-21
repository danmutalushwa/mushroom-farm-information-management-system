const mongoose = require('mongoose');

/**
 * Invoice Schema
 * Tracks invoices generated for sales
 */
const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
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
    customerEmail: {
        type: String,
        default: null,
        trim: true
    },
    customerAddress: {
        type: String,
        default: null,
        trim: true
    },
    items: [{
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
    taxRate: {
        type: Number,
        default: 0
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
    invoiceDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        default: null
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    pdfUrl: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: null
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Generate invoice number and handle math calculations before saving
InvoiceSchema.pre('save', function() {
    if (this.isNew && !this.invoiceNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.invoiceNumber = `INV-${year}${month}${day}-${random}`;
    }
    
    // Calculate balance due safely
    this.balanceDue = this.totalAmount - this.amountPaid;
    if (this.balanceDue < 0) this.balanceDue = 0;
    
    // Update isPaid status dynamically
    this.isPaid = this.amountPaid >= this.totalAmount;
    
    // Set due date if not provided (default to 30 days window)
    if (!this.dueDate) {
        const dueDate = new Date(this.invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);
        this.dueDate = dueDate;
    }

});

// Virtual for is overdue
InvoiceSchema.virtual('isOverdue').get(function() {
    if (this.isPaid) return false;
    if (!this.dueDate) return false;
    return new Date() > this.dueDate;
});

// Virtual for days overdue calculation
InvoiceSchema.virtual('daysOverdue').get(function() {
    if (!this.isOverdue) return 0;
    const now = new Date();
    const diffTime = Math.abs(now - this.dueDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Index declarations for faster aggregations and lookup operations
InvoiceSchema.index({ saleId: 1 });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ invoiceDate: -1 });
InvoiceSchema.index({ isPaid: 1 });
InvoiceSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
