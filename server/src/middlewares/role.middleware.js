const { ROLE_PERMISSIONS } = require('../config/roles');
const { AppError } = require('./error.middleware');

/**
 * Role Middleware
 * Checks if user has required permissions
 */

/**
 * Check if user has a specific permission
 * @param {string} permission - Permission to check
 * @returns {Function} Middleware function
 */
const hasPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Please login first'
            });
        }

        const userRole = req.user.role;
        const permissions = ROLE_PERMISSIONS[userRole];
        
        if (!permissions || !permissions[permission]) {
            return res.status(403).json({
                status: 'fail',
                message: `You do not have permission to perform this action. Required: ${permission}`
            });
        }

        next();
    };
};

/**
 * Check if user has any of the specified permissions
 * @param {string[]} permissions - List of permissions to check
 * @returns {Function} Middleware function
 */
const hasAnyPermission = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Please login first'
            });
        }

        const userRole = req.user.role;
        const userPermissions = ROLE_PERMISSIONS[userRole];
        
        if (!userPermissions) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action'
            });
        }

        const hasPermission = permissions.some(p => userPermissions[p] === true);
        
        if (!hasPermission) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action'
            });
        }

        next();
    };
};

/**
 * Check if user has all of the specified permissions
 * @param {string[]} permissions - List of permissions to check
 * @returns {Function} Middleware function
 */
const hasAllPermissions = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Please login first'
            });
        }

        const userRole = req.user.role;
        const userPermissions = ROLE_PERMISSIONS[userRole];
        
        if (!userPermissions) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action'
            });
        }

        const hasAll = permissions.every(p => userPermissions[p] === true);
        
        if (!hasAll) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have all required permissions'
            });
        }

        next();
    };
};

module.exports = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
};