const { PAYMENT_METHODS, PAYMENT_STATUS } = require('../config/constants');

/**
 * Validate sale data
 */
const validateSale = (data) => {
    const errors = [];

    if (!data.orderId) {
        errors.push('Order ID is required');
    }

    if (!data.items || data.items.length === 0) {
        errors.push('Sale must contain at least one item');
    }

    if (data.items) {
        data.items.forEach((item, index) => {
            if (!item.productId) {
                errors.push(`Item ${index + 1}: Product ID is required`);
            }
            if (!item.quantity || item.quantity < 1) {
                errors.push(`Item ${index + 1}: Quantity must be at least 1`);
            }
            if (!item.unitPrice || item.unitPrice < 0) {
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

    // Treat 'Cash' as a standard fallback if paymentMethod is empty
    const checkSaleMethod = data.paymentMethod || 'Cash';
    if (!PAYMENT_METHODS.includes(checkSaleMethod)) {
        errors.push(`Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Validate payment data
 */
const validatePayment = (data) => {
    const errors = [];

    if (!data.saleId) {
        errors.push('Sale ID is required');
    }

    // Convert to a number explicitly to ensure string integers do not fail validation
    const paymentAmount = Number(data.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        errors.push('Payment amount must be greater than 0');
    }

    // Handle fallback string context cleanly
    const checkPaymentMethod = data.paymentMethod || 'Cash';
    if (!checkPaymentMethod) {
        errors.push('Payment method is required');
    } else if (!PAYMENT_METHODS.includes(checkPaymentMethod)) {
        errors.push(`Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Validate invoice generation
 */
const validateInvoice = (data) => {
    const errors = [];

    if (!data.saleId) {
        errors.push('Sale ID is required');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateSale,
    validatePayment,
    validateInvoice
};
