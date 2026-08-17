const User = require('../models/User');
const Customer = require('../models/Customer');
const { generateToken } = require('../config/jwt');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');
const { isEmailValid, isPhoneValid } = require('../utils/helpers');
const { ROLES } = require('../config/roles');

/**
 * Authentication Service
 * Handles all authentication business logic
 */
class AuthService {
    /**
     * Register a new user (Admin only - for staff)
     */
    async register(userData) {
        const { fullName, email, phoneNumber, password, role } = userData;

        // Validate email
        if (!isEmailValid(email)) {
            throw new AppError('Please enter a valid email address', 400);
        }

        // Validate phone
        if (!isPhoneValid(phoneNumber)) {
            throw new AppError('Please enter a valid phone number', 400);
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phoneNumber }]
        });

        if (existingUser) {
            throw new AppError('User with this email or phone number already exists', 400);
        }

        // Only one Farm Manager can exist in the system
        if (role === ROLES.FARM_MANAGER) {
            const existingFarmManager = await User.findOne({
                role: ROLES.FARM_MANAGER
            });
            if (existingFarmManager) {
                throw new AppError(
                    'A Farm Manager already exists. Deactivate or manage the existing Farm Manager instead.',
                    400
                );
            }
        }

        // Create user
        const user = await User.create({
            fullName,
            email,
            phoneNumber,
            password,
            role: role || ROLES.FARM_WORKER
        });

        logger.info(`User registered: ${user.email}`, { 
            userId: user._id, 
            role: user.role 
        });

        // Generate token
        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return {
            user: this.sanitizeUser(user),
            token
        };
    }

    /**
     * Register a new customer (Admin only)
     * FIXED: Properly handles admin-created customers
     */
    async registerCustomer(customerData) {
        const { 
            fullName, 
            phoneNumber, 
            email, 
            address, 
            customerType, 
            password, 
            createdBy,
            notes 
        } = customerData;

        // Validate required fields
        if (!fullName || !phoneNumber) {
            throw new AppError('Full name and phone number are required', 400);
        }

        // Validate email (if provided)
        if (email && !isEmailValid(email)) {
            throw new AppError('Please enter a valid email address', 400);
        }

        // Validate phone
        if (!isPhoneValid(phoneNumber)) {
            throw new AppError('Please enter a valid phone number', 400);
        }

        // Validate password if provided
        if (password && password.length < 6) {
            throw new AppError('Password must be at least 6 characters', 400);
        }

        // Clean data - convert empty strings to null
        const cleanEmail = email || null;
        const cleanAddress = address || null;
        const cleanCreatedBy = createdBy || null;

        // Check if customer exists by phone
        const existingCustomer = await Customer.findOne({ phoneNumber });
        if (existingCustomer) {
            throw new AppError('Customer with this phone number already exists', 400);
        }

        // Check if user exists by email (if provided)
        if (cleanEmail) {
            const existingUser = await User.findOne({ email: cleanEmail });
            if (existingUser) {
                throw new AppError('Email already in use', 400);
            }
        }

        // Create customer with cleaned data
        const customer = await Customer.create({
            fullName,
            phoneNumber,
            email: cleanEmail,
            address: cleanAddress,
            customerType: customerType || 'Individual',
            notes: notes || null,
            createdBy: cleanCreatedBy
        });

        // Generate unique email for user if not provided
        const userEmail = cleanEmail || `${phoneNumber.replace(/[^0-9]/g, '')}@customer.temp`;

        // Use provided password or default
        const finalPassword = password || 'Customer@123';

        // Create user account for customer
        const user = await User.create({
            fullName,
            email: userEmail,
            phoneNumber,
            password: finalPassword,
            role: ROLES.CUSTOMER,
            customerId: customer._id,
            isActive: true 
        });

        logger.info(`Customer registered by admin: ${customer.fullName}`, { 
            customerId: customer._id,
            userId: user._id,
            createdBy: cleanCreatedBy || 'System'
        });

        // Don't generate token for admin-created customers
        return {
            user: this.sanitizeUser(user), 
            customer: customer,
            message: 'Customer created successfully'
        };
    }

    /**
     * Public customer registration (no admin required)
     */
    async publicRegisterCustomer(customerData) {
        const { 
            fullName, 
            phoneNumber, 
            email, 
            address, 
            customerType, 
            password 
        } = customerData;

        // Validate required fields
        if (!fullName || !phoneNumber || !password) {
            throw new AppError('Full name, phone number and password are required', 400);
        }

        // Validate email (if provided)
        if (email && !isEmailValid(email)) {
            throw new AppError('Please enter a valid email address', 400);
        }

        // Validate phone
        if (!isPhoneValid(phoneNumber)) {
            throw new AppError('Please enter a valid phone number', 400);
        }

        // Validate password
        if (password.length < 6) {
            throw new AppError('Password must be at least 6 characters', 400);
        }

        // Clean data - convert empty strings to null
        const cleanEmail = email || null;
        const cleanAddress = address || null;

        // Check if customer exists by phone
        const existingCustomer = await Customer.findOne({ phoneNumber });
        if (existingCustomer) {
            throw new AppError('Customer with this phone number already exists', 400);
        }

        // Check if user exists by email (if provided)
        if (cleanEmail) {
            const existingUser = await User.findOne({ email: cleanEmail });
            if (existingUser) {
                throw new AppError('Email already in use', 400);
            }
        }

        // Create customer with cleaned data
        const customer = await Customer.create({
            fullName,
            phoneNumber,
            email: cleanEmail,
            address: cleanAddress,
            customerType: customerType || 'Individual',
            createdBy: null // Public registration has no admin
        });

        // Generate unique email for user if not provided
        const userEmail = cleanEmail || `${phoneNumber.replace(/[^0-9]/g, '')}@customer.temp`;

        // Create user account for customer
        const user = await User.create({
            fullName,
            email: userEmail,
            phoneNumber,
            password: password,
            role: ROLES.CUSTOMER,
            customerId: customer._id,
            isActive: true 
        });

        logger.info(`Customer registered publicly: ${customer.fullName}`, { 
            customerId: customer._id,
            userId: user._id
        });

        // Generate token for public registration
        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return {
            user: this.sanitizeUser(user),
            customer: customer,
            token
        };
    }

    /**
     * Login user
     */
    async login(email, password) {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        if (!user.isActive) {
            throw new AppError('Your account has been deactivated. Please contact administrator', 401);
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        logger.info(`User logged in: ${user.email}`, { userId: user._id });

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        let customerData = null;
        if (user.role === ROLES.CUSTOMER && user.customerId) {
            customerData = await Customer.findById(user.customerId);
        }

        return {
            user: this.sanitizeUser(user),
            customer: customerData,
            token
        };
    }

    /**
     * Get current user profile
     */
    async getCurrentUser(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const userData = this.sanitizeUser(user);

        if (user.role === ROLES.CUSTOMER && user.customerId) {
            const customer = await Customer.findById(user.customerId);
            if (customer) {
                userData.customerDetails = customer;
            }
        }

        return userData;
    }

    /**
     * Change user password
     */
    async changePassword(userId, currentPassword, newPassword, confirmNewPassword) {
        if (newPassword !== confirmNewPassword) {
            throw new AppError('New password and confirmation do not match', 400);
        }

        if (newPassword.length < 6) {
            throw new AppError('New password must be at least 6 characters', 400);
        }

        const user = await User.findById(userId).select('+password');
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new AppError('Current password is incorrect', 401);
        }

        user.password = newPassword;
        await user.save();

        logger.info(`Password changed for user: ${user.email}`, { userId: user._id });

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return {
            message: 'Password changed successfully',
            token
        };
    }

    /**
     * Sanitize user object (remove sensitive data)
     */
    sanitizeUser(user) {
        const userObject = user.toObject ? user.toObject() : user;
        delete userObject.password;
        delete userObject.passwordResetToken;
        delete userObject.passwordResetExpires;
        return userObject;
    }
}

// Export instance
module.exports = new AuthService();