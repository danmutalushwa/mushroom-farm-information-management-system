const logger = require('../utils/logger');

/**
 * Custom App Error Class
 * Extends native Error with status code and operational flag
 */
class AppError extends Error {
    constructor(message, statusCode = 500, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error(`Error: ${err.message}`, {
        path: req.path,
        method: req.method,
        body: req.body,
        user: req.user?.id,
        stack: err.stack
    });

    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || null;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = Object.values(err.errors).map(e => e.message);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyPattern)[0];
        message = `Duplicate value for ${field}. Please use a different value.`;
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please login again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please login again.';
    }

    // Send response
    res.status(statusCode).json({
        status: statusCode >= 500 ? 'error' : 'fail',
        message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            error: err
        }),
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    errorHandler,
    AppError
};