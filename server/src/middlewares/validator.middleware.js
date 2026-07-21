const { validationResult } = require('express-validator');

/**
 * Validator Middleware
 * Validates request data using express-validator
 */

/**
 * Validate request
 * @param {Array} validations - Array of validation rules
 * @returns {Function} Middleware function
 */
const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Get validation errors
        const errors = validationResult(req);
        
        if (errors.isEmpty()) {
            return next();
        }

        // Format errors
        const formattedErrors = errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value
        }));

        return res.status(400).json({
            status: 'fail',
            message: 'Validation failed',
            errors: formattedErrors
        });
    };
};

/**
 * Validate request body
 * @param {Object} schema - Validation schema
 * @returns {Function} Middleware function
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        const errors = [];
        
        Object.keys(schema).forEach(field => {
            const rules = schema[field];
            const value = req.body[field];
            
            // Check required
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push({
                    field,
                    message: `${field} is required`
                });
                return;
            }
            
            // Skip validation if field is optional and not provided
            if (!rules.required && (value === undefined || value === null || value === '')) {
                return;
            }
            
            // Check type
            if (rules.type) {
                const actualType = Array.isArray(value) ? 'array' : typeof value;
                if (actualType !== rules.type) {
                    errors.push({
                        field,
                        message: `${field} must be of type ${rules.type}`
                    });
                    return;
                }
            }
            
            // Check min length
            if (rules.minLength && value.length < rules.minLength) {
                errors.push({
                    field,
                    message: `${field} must be at least ${rules.minLength} characters`
                });
                return;
            }
            
            // Check max length
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push({
                    field,
                    message: `${field} cannot exceed ${rules.maxLength} characters`
                });
                return;
            }
            
            // Check min value
            if (rules.min && value < rules.min) {
                errors.push({
                    field,
                    message: `${field} must be at least ${rules.min}`
                });
                return;
            }
            
            // Check max value
            if (rules.max && value > rules.max) {
                errors.push({
                    field,
                    message: `${field} cannot exceed ${rules.max}`
                });
                return;
            }
            
            // Check enum
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push({
                    field,
                    message: `${field} must be one of: ${rules.enum.join(', ')}`
                });
                return;
            }
            
            // Check pattern
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push({
                    field,
                    message: `${field} has invalid format`
                });
                return;
            }
        });
        
        if (errors.length > 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation failed',
                errors
            });
        }
        
        next();
    };
};

module.exports = {
    validate,
    validateBody
};