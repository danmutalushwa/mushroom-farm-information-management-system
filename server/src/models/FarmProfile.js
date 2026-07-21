const mongoose = require('mongoose');

/**
 * Farm Profile Schema
 * Stores farm organization information
 */
const FarmProfileSchema = new mongoose.Schema({
    farmName: {
        type: String,
        required: [true, 'Farm name is required'],
        trim: true,
        unique: true
    },
    farmCode: {
        type: String,
        required: [true, 'Farm code is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    registrationNumber: {
        type: String,
        default: null,
        trim: true
    },
    taxIdentificationNumber: {
        type: String,
        default: null,
        trim: true
    },
    logo: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    alternativePhone: {
        type: String,
        default: null,
        trim: true
    },
    address: {
        street: {
            type: String,
            default: null
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            default: 'Kigali'
        },
        district: {
            type: String,
            required: [true, 'District is required']
        },
        sector: {
            type: String,
            default: null
        },
        cell: {
            type: String,
            default: null
        },
        postalCode: {
            type: String,
            default: null
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            default: 'Rwanda'
        }
    },
    website: {
        type: String,
        default: null
    },
    socialMedia: {
        facebook: { type: String, default: null },
        twitter: { type: String, default: null },
        instagram: { type: String, default: null },
        linkedin: { type: String, default: null }
    },
    operatingHours: {
        monday: { type: String, default: '08:00-17:00' },
        tuesday: { type: String, default: '08:00-17:00' },
        wednesday: { type: String, default: '08:00-17:00' },
        thursday: { type: String, default: '08:00-17:00' },
        friday: { type: String, default: '08:00-17:00' },
        saturday: { type: String, default: '08:00-13:00' },
        sunday: { type: String, default: 'Closed' }
    },
    description: {
        type: String,
        default: null
    },
    bankingDetails: {
        bankName: { type: String, default: null },
        accountNumber: { type: String, default: null },
        accountName: { type: String, default: null },
        swiftCode: { type: String, default: null },
        branch: { type: String, default: null }
    },
    settings: {
        currency: { type: String, default: 'RWF' },
        dateFormat: { type: String, default: 'YYYY-MM-DD' },
        timeFormat: { type: String, default: 'HH:mm' },
        timezone: { type: String, default: 'Africa/Kigali' },
        taxRate: { type: Number, default: 18 },
        measurementUnit: { type: String, default: 'kg' }
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Generate farm code before saving
FarmProfileSchema.pre('save', function() {
    if (this.isNew && !this.farmCode) {
        const prefix = this.farmName.substring(0, 3).toUpperCase();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.farmCode = `${prefix}-${random}`;
    }
    
});

module.exports = mongoose.model('FarmProfile', FarmProfileSchema);