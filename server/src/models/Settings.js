const mongoose = require('mongoose');

/**
 * Settings Schema
 * Stores system-wide configuration settings
 */
const SettingsSchema = new mongoose.Schema({
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['general', 'security', 'notification', 'email', 'payment', 'inventory', 'production', 'report'],
        trim: true
    },
    key: {
        type: String,
        required: [true, 'Setting key is required'],
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Setting value is required']
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true
    },
    description: {
        type: String,
        default: null
    },
    dataType: {
        type: String,
        enum: ['string', 'number', 'boolean', 'object', 'array'],
        default: 'string'
    },
    isRequired: {
        type: Boolean,
        default: false
    },
    isEditable: {
        type: Boolean,
        default: true
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    options: {
        type: [String],
        default: []
    },
    defaultValue: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    validation: {
        min: { type: Number, default: null },
        max: { type: Number, default: null },
        pattern: { type: String, default: null }
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index for unique category + key
SettingsSchema.index({ category: 1, key: 1 }, { unique: true });

// Get setting value
SettingsSchema.statics.getSetting = async function(category, key) {
    const setting = await this.findOne({ category, key });
    return setting ? setting.value : null;
};

// Set setting value
SettingsSchema.statics.setSetting = async function(category, key, value, userId) {
    const setting = await this.findOne({ category, key });
    if (setting) {
        setting.value = value;
        setting.updatedBy = userId;
        await setting.save();
        return setting;
    }
    return null;
};

module.exports = mongoose.model('Settings', SettingsSchema);