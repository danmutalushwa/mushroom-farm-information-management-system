const { MUSHROOM_TYPES, PRODUCTION_STATUS } = require('../config/constants');

/**
 * Validate production batch data
 */
const validateProductionBatch = (data) => {
    const errors = [];

    // Mushroom type validation
    if (!data.mushroomType) {
        errors.push('Mushroom type is required');
    } else if (!MUSHROOM_TYPES.includes(data.mushroomType)) {
        errors.push(`Invalid mushroom type. Must be one of: ${MUSHROOM_TYPES.join(', ')}`);
    }

    // Spawn type validation
    if (!data.spawnType || data.spawnType.trim().length < 2) {
        errors.push('Spawn type must be at least 2 characters');
    }

    // Production room validation
    if (!data.productionRoom || data.productionRoom.trim().length < 1) {
        errors.push('Production room is required');
    }

    // Start date validation
    if (!data.startDate) {
        errors.push('Start date is required');
    }

    // Expected harvest date validation
    if (!data.expectedHarvestDate) {
        errors.push('Expected harvest date is required');
    }

    // Date logic validation
    if (data.startDate && data.expectedHarvestDate) {
        const start = new Date(data.startDate);
        const expected = new Date(data.expectedHarvestDate);
        if (expected <= start) {
            errors.push('Expected harvest date must be after start date');
        }
    }

    // Spawn quantity validation
    if (data.spawnQuantity !== undefined && data.spawnQuantity < 0) {
        errors.push('Spawn quantity cannot be negative');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Validate harvest data
 */
const validateHarvest = (data) => {
    const errors = [];

    if (!data.harvestDate) {
        errors.push('Harvest date is required');
    }

    if (!data.quantity || data.quantity <= 0) {
        errors.push('Harvest quantity must be greater than 0');
    }

    if (data.grade && !['A', 'B', 'C'].includes(data.grade)) {
        errors.push('Invalid grade. Must be A, B, or C');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Validate production loss data
 */
const validateProductionLoss = (data) => {
    const errors = [];

    if (!data.lossQuantity || data.lossQuantity <= 0) {
        errors.push('Loss quantity must be greater than 0');
    }

    if (!data.lossReason) {
        errors.push('Loss reason is required');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Validate batch status update
 */
const validateStatusUpdate = (data) => {
    const errors = [];

    if (!data.status) {
        errors.push('Status is required');
    } else if (!Object.values(PRODUCTION_STATUS).includes(data.status)) {
        errors.push(
            `Invalid status. Must be one of: ${PRODUCTION_STATUS.join(', ')}`
        );
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateProductionBatch,
    validateHarvest,
    validateProductionLoss,
    validateStatusUpdate
};