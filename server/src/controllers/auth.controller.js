const AuthService = require('../services/auth.service');
const logger = require('../utils/logger');

/**
 * Register new user (Admin only - for staff)
 */
const register = async (req, res, next) => {
    try {
        const result = await AuthService.register(req.body);
        
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: result
        });
    } catch (error) {
        logger.error('Register error:', error.message);
        next(error);
    }
};

/**
 * Register new customer (Admin only - from dashboard)
 * Creates both Customer and User accounts
 */
const registerCustomer = async (req, res, next) => {
    try {
        // Inject the admin's ID as createdBy
        const customerPayload = {
            ...req.body,
            createdBy: req.user?.id || req.user?._id || null
        };

        const result = await AuthService.registerCustomer(customerPayload);
        
        res.status(201).json({
            status: 'success',
            message: 'Customer registered successfully',
            data: result
        });
    } catch (error) {
        logger.error('Register customer error:', error.message);
        next(error);
    }
};

/**
 * NEW: Public customer registration (No auth required)
 * For customers signing up from the public registration page
 */
const publicRegisterCustomer = async (req, res, next) => {
    try {
        const result = await AuthService.publicRegisterCustomer(req.body);
        
        res.status(201).json({
            status: 'success',
            message: 'Registration successful! Please login.',
            data: result
        });
    } catch (error) {
        logger.error('Public register customer error:', error.message);
        next(error);
    }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password'
            });
        }

        const result = await AuthService.login(email, password);
        
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: result
        });
    } catch (error) {
        logger.error('Login error:', error.message);
        next(error);
    }
};

/**
 * Get current user profile
 */
const getMe = async (req, res, next) => {
    try {
        const user = await AuthService.getCurrentUser(req.user.id);
        
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        logger.error('Get me error:', error.message);
        next(error);
    }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        
        // Validate required fields
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide current password, new password, and confirmation'
            });
        }
        
        const result = await AuthService.changePassword(
            req.user.id,
            currentPassword,
            newPassword,
            confirmNewPassword
        );
        
        res.status(200).json({
            status: 'success',
            message: result.message,
            data: { token: result.token }
        });
    } catch (error) {
        logger.error('Change password error:', error.message);
        next(error);
    }
};

module.exports = {
    register,
    registerCustomer,
    publicRegisterCustomer, 
    login,
    getMe,
    changePassword
};