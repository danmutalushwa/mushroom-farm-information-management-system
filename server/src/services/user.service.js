const User = require('../models/User');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');
const { isEmailValid, isPhoneValid } = require('../utils/helpers');

/**
 * User Service
 * Handles all user management business logic
 */
class UserService {
    /**
     * Get all users with pagination
     */
    async getAllUsers(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter = {};
        if (filters.role) filter.role = filters.role;
        if (filters.isActive !== undefined) filter.isActive = filters.isActive === 'true';
        if (filters.search) {
            filter.$or = [
                { fullName: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
                { phoneNumber: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            User.countDocuments(filter)
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }

    /**
     * Update user
     */
    async updateUser(userId, updateData) {
        const { fullName, phoneNumber, role, isActive } = updateData;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Validate phone if provided
        if (phoneNumber && !isPhoneValid(phoneNumber)) {
            throw new AppError('Please enter a valid phone number', 400);
        }

        // Check if phone number is taken by another user
        if (phoneNumber && phoneNumber !== user.phoneNumber) {
            const existingUser = await User.findOne({ phoneNumber, _id: { $ne: userId } });
            if (existingUser) {
                throw new AppError('Phone number already in use by another user', 400);
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                fullName: fullName || user.fullName,
                phoneNumber: phoneNumber || user.phoneNumber,
                role: role || user.role,
                isActive: isActive !== undefined ? isActive : user.isActive
            },
            { new: true, runValidators: true }
        ).select('-password');

        logger.info(`User updated: ${updatedUser.email}`, { 
            userId: updatedUser._id, 
            updatedBy: userId 
        });

        return updatedUser;
    }

    /**
     * Deactivate user
     */
    async deactivateUser(userId, currentUserId) {
        // Prevent self-deactivation
        if (userId === currentUserId) {
            throw new AppError('You cannot deactivate your own account', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (!user.isActive) {
            throw new AppError('User is already deactivated', 400);
        }

        user.isActive = false;
        await user.save();

        logger.info(`User deactivated: ${user.email}`, { 
            userId: user._id, 
            deactivatedBy: currentUserId 
        });

        return user;
    }

    /**
     * Activate user
     */
    async activateUser(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (user.isActive) {
            throw new AppError('User is already active', 400);
        }

        user.isActive = true;
        await user.save();

        logger.info(`User activated: ${user.email}`, { userId: user._id });

        return user;
    }

    /**
     * Delete user (permanent)
     */
    async deleteUser(userId, currentUserId) {
        // Prevent self-deletion
        if (userId === currentUserId) {
            throw new AppError('You cannot delete your own account', 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        await User.findByIdAndDelete(userId);

        logger.info(`User deleted: ${user.email}`, { 
            userId: user._id, 
            deletedBy: currentUserId 
        });

        return user;
    }

    /**
     * Update user role
     */
    async updateUserRole(userId, role) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        user.role = role;
        await user.save();

        logger.info(`User role updated: ${user.email}`, { 
            userId: user._id, 
            newRole: role 
        });

        return user;
    }
}

module.exports = new UserService();