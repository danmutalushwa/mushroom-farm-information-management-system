/**
 * Helper Functions
 * Common utility functions used across the application
 */

/**
 * Generate unique ID with optional prefix
 */
const generateId = (prefix = '') => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}${timestamp}${random}`.toUpperCase();
};

/**
 * Generate production batch number
 * Format: BATCH-YYMMDD-RANDOM
 */
const generateBatchNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BATCH-${year}${month}${day}-${random}`;
};

/**
 * Generate invoice number
 * Format: INV-YYMMDD-RANDOM
 */
const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}${day}-${random}`;
};

/**
 * Generate order number
 * Format: ORD-YYMMDD-RANDOM
 */
const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return input.trim().replace(/[<>]/g, '');
    }
    return input;
};

/**
 * Validate email format
 */
const isEmailValid = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
const isPhoneValid = (phone) => {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone);
};

/**
 * Check if string is empty or whitespace
 */
const isEmpty = (value) => {
    return !value || (typeof value === 'string' && value.trim().length === 0);
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = 'RWF') => {
    return `${currency} ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
};

/**
 * Truncate text
 */
const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

module.exports = {
    generateId,
    generateBatchNumber,
    generateInvoiceNumber,
    generateOrderNumber,
    sanitizeInput,
    isEmailValid,
    isPhoneValid,
    isEmpty,
    formatCurrency,
    truncateText
};