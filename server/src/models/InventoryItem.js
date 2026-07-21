const mongoose = require('mongoose');

/**
 * Inventory Item Schema
 * Tracks raw materials, packaging materials, and finished products
 */
const InventoryItemSchema = new mongoose.Schema({
    itemCode: {
        type: String,
        unique: true,
        trim: true,
        uppercase: true
    },
    itemName: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Raw Material', 'Spawn', 'Packaging Material', 'Finished Product', 'Other']
    },
    description: {
        type: String,
        default: null
    },
    unitOfMeasurement: {
        type: String,
        required: [true, 'Unit of measurement is required'],
        enum: ['kg', 'g', 'litre', 'ml', 'piece', 'pack', 'bag', 'box', 'bottle', 'other']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        default: 0,
        min: [0, 'Quantity cannot be negative']
    },
    minimumStockLevel: {
        type: Number,
        required: [true, 'Minimum stock level is required'],
        default: 10,
        min: [0, 'Minimum stock level cannot be negative']
    },
    maximumStockLevel: {
        type: Number,
        default: null,
        min: [0, 'Maximum stock level cannot be negative']
    },
    supplier: {
        type: String,
        default: null
    },
    unitPrice: {
        type: Number,
        default: 0,
        min: [0, 'Unit price cannot be negative']
    },
    location: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Generate item code before saving
InventoryItemSchema.pre('save', async function() {
    if (this.isNew && !this.itemCode) {
        const categoryStr = this.category ? String(this.category) : 'GEN';
        const prefix = this.category.substring(0, 3).toUpperCase();
        const random = Math.floor(1000 + Math.random() * 9000).toString();

        this.itemCode = `${prefix}-${random}`;
    }
    
});

// Virtual for stock status
InventoryItemSchema.virtual('stockStatus').get(function() {
    if (this.quantity <= 0) return 'Out of Stock';
    if (this.quantity <= this.minimumStockLevel) return 'Low Stock';
    if (this.maximumStockLevel && this.quantity >= this.maximumStockLevel) return 'Overstock';
    return 'In Stock';
});

// Virtual for stock percentage
InventoryItemSchema.virtual('stockPercentage').get(function() {
    if (this.maximumStockLevel) {
        return (this.quantity / this.maximumStockLevel) * 100;
    }
    return 100;
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);