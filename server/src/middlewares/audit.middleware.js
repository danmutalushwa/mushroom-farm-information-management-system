const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Audit Middleware
 * Logs all user activities and system events
 */
const auditLog = async (req, res, next) => {
    // Store the original send function
    const originalSend = res.send;
    
    // Track start time for response time calculation
    const startTime = Date.now();
    
    // Override send function to capture response
    res.send = function(data) {
        const responseTime = Date.now() - startTime;
        
        // Only log if user is authenticated
        if (req.user) {
            const logData = {
                userId: req.user.id,
                userEmail: req.user.email,
                userRole: req.user.role,
                userFullName: req.user.fullName,
                action: req.method + ' ' + req.path,
                module: getModuleFromPath(req.path),
                description: `${req.method} ${req.path}`,
                method: req.method,
                endpoint: req.path,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                requestBody: sanitizeBody(req.body),
                requestQuery: req.query,
                requestParams: req.params,
                responseStatus: res.statusCode,
                responseTime: responseTime,
                status: res.statusCode >= 400 ? 'failed' : 'success',
                resourceId: req.params.id || null,
                resourceType: getResourceTypeFromPath(req.path)
            };
            
            // Log asynchronously
            AuditLog.create(logData).catch(err => {
                logger.error('Failed to create audit log:', err.message);
            });
        }
        
        // Call original send
        originalSend.call(this, data);
    };
    
    next();
};

/**
 * Get module name from path
 */
const getModuleFromPath = (path) => {
    const parts = path.split('/').filter(p => p);
    if (parts.length === 0) return 'unknown';
    return parts[0] || 'unknown';
};

/**
 * Get resource type from path
 */
const getResourceTypeFromPath = (path) => {
    const parts = path.split('/').filter(p => p);
    if (parts.length < 2) return null;
    // Remove 'api' if present
    if (parts[0] === 'api') {
        return parts[1] || null;
    }
    return parts[0] || null;
};

/**
 * Sanitize request body (remove sensitive data)
 */
const sanitizeBody = (body) => {
    if (!body) return null;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'confirmNewPassword', 'token', 'accessToken', 'refreshToken'];
    
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '***REDACTED***';
        }
    });
    
    return sanitized;
};

module.exports = auditLog;