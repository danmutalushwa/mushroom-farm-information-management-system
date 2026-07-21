const logger = require('../utils/logger');

/**
 * Logger Middleware
 * Logs all incoming requests
 */
const loggerMiddleware = (req, res, next) => {
    const startTime = Date.now();
    
    // Log request
    logger.info(`📥 ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        query: req.query,
        body: sanitizeBody(req.body),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        user: req.user ? req.user.id : 'unauthenticated'
    });
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function to log response
    res.end = function(chunk, encoding) {
        const responseTime = Date.now() - startTime;
        
        // Log response
        const logLevel = res.statusCode >= 400 ? 'error' : 'info';
        logger[logLevel](`📤 ${req.method} ${req.path} - ${res.statusCode} (${responseTime}ms)`, {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            user: req.user ? req.user.id : 'unauthenticated'
        });
        
        // Call original end
        originalEnd.call(this, chunk, encoding);
    };
    
    next();
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

module.exports = loggerMiddleware;