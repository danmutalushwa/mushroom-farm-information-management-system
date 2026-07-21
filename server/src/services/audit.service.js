const AuditLog = require('../models/AuditLog');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');

/**
 * Audit Service
 * Handles audit log management and retrieval
 */
class AuditService {
    /**
     * Create audit log entry
     */
    async createLog(logData) {
        try {
            const log = await AuditLog.create(logData);
            return log;
        } catch (error) {
            logger.error('Failed to create audit log:', error.message);
            // Don't throw error to prevent disrupting the main flow
            return null;
        }
    }

    /**
     * Get all audit logs with pagination and filters
     */
    async getAllLogs(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter = {};
        if (filters.userId) filter.userId = filters.userId;
        if (filters.action) filter.action = { $regex: filters.action, $options: 'i' };
        if (filters.module) filter.module = filters.module;
        if (filters.status) filter.status = filters.status;
        if (filters.userEmail) filter.userEmail = { $regex: filters.userEmail, $options: 'i' };
        
        // Date range filters
        if (filters.startDate || filters.endDate) {
            filter.createdAt = {};
            if (filters.startDate) filter.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate) filter.createdAt.$lte = new Date(filters.endDate);
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .populate('userId', 'fullName email role')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            AuditLog.countDocuments(filter)
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get audit log by ID
     */
    async getLogById(logId) {
        const log = await AuditLog.findById(logId)
            .populate('userId', 'fullName email role');

        if (!log) {
            throw new AppError('Audit log not found', 404);
        }

        return log;
    }

    /**
     * Get audit logs by user
     */
    async getLogsByUser(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        const [logs, total] = await Promise.all([
            AuditLog.find({ userId })
                .populate('userId', 'fullName email role')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            AuditLog.countDocuments({ userId })
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get audit logs by module
     */
    async getLogsByModule(module, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        const [logs, total] = await Promise.all([
            AuditLog.find({ module })
                .populate('userId', 'fullName email role')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            AuditLog.countDocuments({ module })
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get audit log statistics
     */
    async getStatistics(startDate, endDate) {
        const dateFilter = {};
        if (startDate) dateFilter.createdAt = { $gte: new Date(startDate) };
        if (endDate) dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(endDate) };

        const filter = { ...dateFilter };

        const [
            totalLogs,
            successfulLogs,
            failedLogs,
            errorLogs,
            byModule,
            byAction,
            byUser
        ] = await Promise.all([
            AuditLog.countDocuments(filter),
            AuditLog.countDocuments({ ...filter, status: 'success' }),
            AuditLog.countDocuments({ ...filter, status: 'failed' }),
            AuditLog.countDocuments({ ...filter, status: 'error' }),
            AuditLog.aggregate([
                { $match: filter },
                { $group: { _id: '$module', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            AuditLog.aggregate([
                { $match: filter },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            AuditLog.aggregate([
                { $match: filter },
                { $group: { _id: '$userEmail', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);

        return {
            summary: {
                totalLogs,
                successfulLogs,
                failedLogs,
                errorLogs,
                successRate: totalLogs > 0 ? ((successfulLogs / totalLogs) * 100).toFixed(2) : 0,
                dateRange: { startDate, endDate }
            },
            byModule,
            byAction,
            byUser
        };
    }

    /**
     * Clean old audit logs
     */
    async cleanOldLogs(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await AuditLog.deleteMany({
            createdAt: { $lt: cutoffDate }
        });

        logger.info(`Cleaned ${result.deletedCount} old audit logs`, {
            daysToKeep,
            cutoffDate: cutoffDate.toISOString()
        });

        return result;
    }
}

module.exports = new AuditService();