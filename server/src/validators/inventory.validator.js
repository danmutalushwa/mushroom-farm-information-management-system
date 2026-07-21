const { INVENTORY_TRANSACTION } = require('../config/constants');

/**
 * Validate inventory item data
 */
const validateInventoryItem = (data) => {
    const errors = [];

    if (!data.itemName || data.itemName.trim().length < 2) {
        errors.push('Item name must be at least 2 characters');
    }

    if (!data.category) {
        errors.push('Category is required');
    }

    if (!data.unitOfMeasurement) {
        errors.push('Unit of measurement is required');
    }

    if (data.quantity !== undefined && data.quantity < 0) {
        errors.push('Quantity cannot be negative');
    }

    if (data.minimumStockLevel !== undefined && data.minimumStockLevel < 0) {
        errors.push('Minimum stock level cannot be negative');
    }

    if (data.maximumStockLevel !== undefined && data.maximumStockLevel < 0) {
        errors.push('Maximum stock level cannot be negative');
    }

    if (data.minimumStockLevel && data.maximumStockLevel && data.minimumStockLevel >= data.maximumStockLevel) {
        errors.push('Minimum stock level must be less than maximum stock level');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Validate stock movement
 */
const validateStockMovement = (data) => {
    const errors = [];
    
    // Converts your object values into a clean array: ['Stock In', 'Stock Out', 'Adjustment']
    const allowedTypes = Object.values(INVENTORY_TRANSACTION || {});

    if (!data.inventoryItemId) {
        errors.push('Inventory item ID is required');
    }

    if (!data.movementType) {
        errors.push('Movement type is required');
    } else if (!allowedTypes.includes(data.movementType)) {
        errors.push(`Invalid movement type. Must be one of: ${allowedTypes.join(', ')}`);
    }

    if (!data.quantity || data.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateInventoryItem,
    validateStockMovement
};