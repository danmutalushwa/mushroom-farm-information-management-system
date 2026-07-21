/**
 * Validate customer data
 */
const validateCustomer = (data) => {
    const errors = [];

    // Full name validation
    if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('Full name must be at least 2 characters');
    }

    // Phone number validation
    if (!data.phoneNumber) {
        errors.push('Phone number is required');
    } else {
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!phoneRegex.test(data.phoneNumber)) {
            errors.push('Please enter a valid phone number');
        }
    }

    // Email validation (optional)
    if (data.email) {
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(data.email)) {
            errors.push('Please enter a valid email address');
        }
    }

    // Customer type validation
    if (data.customerType && !['Individual', 'Business', 'Wholesaler', 'Retailer'].includes(data.customerType)) {
        errors.push('Invalid customer type. Must be Individual, Business, Wholesaler, or Retailer');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateCustomer
};