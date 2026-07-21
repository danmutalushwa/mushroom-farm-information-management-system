const mongoose = require('mongoose');

/**
 * Customer Schema
 * Tracks customer information and purchase history
 */
const CustomerSchema = new mongoose.Schema({
    customerCode: {
        type: String,
        unique: true,
        trim: true,
        uppercase: true
    },
    fullName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number']
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        default: null
    },
    address: {
        type: String,
        default: null,
        trim: true
    },
    customerType: {
        type: String,
        enum: ['Individual', 'Business', 'Wholesaler', 'Retailer'],
        required: [true, 'Customer type is required'],
        default: 'Individual'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalPurchases: {
        type: Number,
        default: 0,
        min: 0
    },
    totalOrders: {
        type: Number,
        default: 0,
        min: 0
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },
    lastPurchaseDate: {
        type: Date,
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
    }
}, {
    timestamps: true
});

// Generate customer code before saving
CustomerSchema.pre('save', function() {
    if (this.isNew && !this.customerCode) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000).toString();
        
        this.customerCode = `CUST-${year}${month}${day}-${random}`;
    }
    
});

// Index for faster queries
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ fullName: 1 });

module.exports = mongoose.model('Customer', CustomerSchema);