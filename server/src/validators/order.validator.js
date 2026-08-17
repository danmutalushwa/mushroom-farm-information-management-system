const { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } = require('../config/constants');

/**
 * Validate order data
 */
const validateOrder = (data) => {
    const errors = [];

    // Safely extract allowed values into clean arrays
    const allowedStatuses = Object.values(ORDER_STATUS || {});
    const allowedPaymentStatuses = Object.values(PAYMENT_STATUS || {});
    const allowedPaymentMethods = Array.isArray(PAYMENT_METHODS) 
        ? PAYMENT_METHODS 
        : Object.values(PAYMENT_METHODS || {});

    if (!data.customerId) {
        errors.push('Customer ID is required');
    }

    if (!data.items || data.items.length === 0) {
        errors.push('Order must contain at least one item');
    }

    if (data.items) {
        data.items.forEach((item, index) => {
            if (!item.productId) {
                errors.push(`Item ${index + 1}: Product ID is required`);
            }
            if (item.quantity === undefined || item.quantity === null || item.quantity < 1) {
                errors.push(`Item ${index + 1}: Quantity must be at least 1`);
            }
            if (item.unitPrice === undefined || item.unitPrice === null || item.unitPrice < 0) {
                errors.push(`Item ${index + 1}: Unit price cannot be negative`);
            }
        });
    }

    if (data.tax !== undefined && data.tax < 0) {
        errors.push('Tax cannot be negative');
    }

    if (data.discount !== undefined && data.discount < 0) {
        errors.push('Discount cannot be negative');
    }

    if (data.status && !allowedStatuses.includes(data.status)) {
        errors.push(`Invalid status. Must be one of: ${allowedStatuses.join(', ')}`);
    }

    if (data.paymentMethod && !allowedPaymentMethods.includes(data.paymentMethod)) {
        errors.push(`Invalid payment method. Must be one of: ${allowedPaymentMethods.join(', ')}`);
    }

    if (data.paymentStatus && !allowedPaymentStatuses.includes(data.paymentStatus)) {
        errors.push(`Invalid payment status. Must be one of: ${allowedPaymentStatuses.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Validate order status update
 */
const validateStatusUpdate = (data) => {
    const errors = [];
    const allowedStatuses = Object.values(ORDER_STATUS || {});

    // 🔧 Fixed: Reads data.status safely instead of an un-declared status variable
    if (!data || !data.status) {
        errors.push('Status is required');
    } else if (!allowedStatuses.includes(data.status)) {
        errors.push(`Invalid order status. Must be one of: ${allowedStatuses.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Validate order cancellation
 */
const validateCancellation = (data) => {
    const errors = [];

    if (!data.reason || data.reason.trim().length < 3) {
        errors.push('Cancellation reason must be at least 3 characters');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateOrder,
    validateStatusUpdate,
    validateCancellation
};