const { verifyToken } = require('../config/jwt');
const User = require('../models/User');
const { AppError } = require('./error.middleware');
const logger = require('../utils/logger');

/**
 * Protect Middleware
 * Verifies JWT token and attaches user to request
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'Please login to access this resource'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid or expired token. Please login again'
            });
        }

        // Find user
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'User no longer exists'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                status: 'fail',
                message: 'Your account has been deactivated. Please contact administrator'
            });
        }

        // Check if password was changed after token was issued
        if (user.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({
                status: 'fail',
                message: 'Password has been changed. Please login again'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        logger.error('Auth middleware error:', error.message);
        return res.status(401).json({
            status: 'fail',
            message: 'Not authorized to access this resource'
        });
    }
};

/**
 * Restrict To Middleware
 * Restricts access to specific roles
 * @param {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Please login first'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: `Role '${req.user.role}' is not authorized to access this resource`
            });
        }

        next();
    };
};

module.exports = {
    protect,
    restrictTo
};