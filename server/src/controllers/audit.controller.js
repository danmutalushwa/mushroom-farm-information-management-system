const AuditService = require('../services/audit.service');
const logger = require('../utils/logger');

/**
 * Get all audit logs
 */
const getAllLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, userId, action, module, status, userEmail, startDate, endDate } = req.query;
        
        const result = await AuditService.getAllLogs(
            parseInt(page),
            parseInt(limit),
            { userId, action, module, status, userEmail, startDate, endDate }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Audit logs retrieved successfully',
            data: result.logs,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get all audit logs error:', error.message);
        next(error);
    }
};

/**
 * Get audit log by ID
 */
const getLogById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const log = await AuditService.getLogById(id);
        
        res.status(200).json({
            status: 'success',
            data: { log }
        });
    } catch (error) {
        logger.error('Get audit log by ID error:', error.message);
        next(error);
    }
};

/**
 * Get audit logs by user
 */
const getLogsByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await AuditService.getLogsByUser(
            userId,
            parseInt(page),
            parseInt(limit)
        );
        
        res.status(200).json({
            status: 'success',
            message: 'User audit logs retrieved successfully',
            data: result.logs,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get logs by user error:', error.message);
        next(error);
    }
};

/**
 * Get audit logs by module
 */
const getLogsByModule = async (req, res, next) => {
    try {
        const { module } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await AuditService.getLogsByModule(
            module,
            parseInt(page),
            parseInt(limit)
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Module audit logs retrieved successfully',
            data: result.logs,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get logs by module error:', error.message);
        next(error);
    }
};

/**
 * Get audit statistics
 */
const getAuditStatistics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await AuditService.getStatistics(startDate, endDate);
        
        res.status(200).json({
            status: 'success',
            message: 'Audit statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        logger.error('Get audit statistics error:', error.message);
        next(error);
    }
};

/**
 * Clean old audit logs
 */
const cleanOldLogs = async (req, res, next) => {
    try {
        const { daysToKeep = 90 } = req.body;
        const result = await AuditService.cleanOldLogs(daysToKeep);
        
        res.status(200).json({
            status: 'success',
            message: `Cleaned ${result.deletedCount} old audit logs`,
            data: result
        });
    } catch (error) {
        logger.error('Clean old logs error:', error.message);
        next(error);
    }
};

module.exports = {
    getAllLogs,
    getLogById,
    getLogsByUser,
    getLogsByModule,
    getAuditStatistics,
    cleanOldLogs
};