const UserService = require('../services/user.service');
const logger = require('../utils/logger');

/**
 * Get all users with pagination
 */
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role, isActive, search } = req.query;
        
        const result = await UserService.getAllUsers(
            parseInt(page),
            parseInt(limit),
            { role, isActive, search }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Users retrieved successfully',
            data: result.users,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get all users error:', error.message);
        next(error);
    }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserService.getUserById(id);
        
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        logger.error('Get user by ID error:', error.message);
        next(error);
    }
};

/**
 * Update user
 */
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserService.updateUser(id, req.body);
        
        res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            data: { user }
        });
    } catch (error) {
        logger.error('Update user error:', error.message);
        next(error);
    }
};

/**
 * Deactivate user
 */
const deactivateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserService.deactivateUser(id, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'User deactivated successfully',
            data: { 
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    isActive: user.isActive
                }
            }
        });
    } catch (error) {
        logger.error('Deactivate user error:', error.message);
        next(error);
    }
};

/**
 * Activate user
 */
const activateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserService.activateUser(id);
        
        res.status(200).json({
            status: 'success',
            message: 'User activated successfully',
            data: { 
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    isActive: user.isActive
                }
            }
        });
    } catch (error) {
        logger.error('Activate user error:', error.message);
        next(error);
    }
};

/**
 * Delete user (permanent)
 */
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await UserService.deleteUser(id, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        logger.error('Delete user error:', error.message);
        next(error);
    }
};

/**
 * Update user role
 */
const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!role) {
            return res.status(400).json({
                status: 'fail',
                message: 'Role is required'
            });
        }
        
        const user = await UserService.updateUserRole(id, role);
        
        res.status(200).json({
            status: 'success',
            message: 'User role updated successfully',
            data: { 
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        logger.error('Update user role error:', error.message);
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deactivateUser,
    activateUser,
    deleteUser,
    updateUserRole
};