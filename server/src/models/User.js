const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/roles');

/**
 * User Schema
 * Represents system users with role-based access control
 */
const UserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
            minlength: [2, 'Full name must be at least 2 characters'],
            maxlength: [100, 'Full name cannot exceed 100 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            unique: true,
            trim: true,
            match: [/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false
        },
        role: {
            type: String,
            enum: Object.values(ROLES),
            required: [true, 'Role is required'],
            default: ROLES.FARM_WORKER  // ← CHANGED: Farm Worker default, not Customer
        },
        isActive: {
            type: Boolean,
            default: true
        },
        profilePicture: {
            type: String,
            default: null
        },
        lastLogin: {
            type: Date,
            default: null
        },
        passwordChangedAt: {
            type: Date,
            default: null
        },
        passwordResetToken: {
            type: String,
            default: null
        },
        passwordResetExpires: {
            type: Date,
            default: null
        },
        // Customer specific field - links to Customer model
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            default: null
        },
        // User preferences
        preferences: {
            theme: {
                type: String,
                enum: ['light', 'dark'],
                default: 'light'
            },
            notifications: {
                email: {
                    type: Boolean,
                    default: true
                },
                inApp: {
                    type: Boolean,
                    default: true
                }
            }
        }
    },
    {
        timestamps: true
    }
);

/**
 * Hash password before saving
 */
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
        this.password = await bcrypt.hash(this.password, salt);
        this.passwordChangedAt = new Date();
    } catch (error) {
        throw error; 
    }
});

/**
 * Compare candidate password with stored hash
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if password was changed after JWT was issued
 */
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

module.exports = mongoose.model('User', UserSchema);