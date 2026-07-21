const ProductionService = require('../services/production.service');
const logger = require('../utils/logger');

/**
 * Create a new production batch
 */
const createBatch = async (req, res, next) => {
    try {
        const batch = await ProductionService.createBatch(req.body, req.user.id);
        
        res.status(201).json({
            status: 'success',
            message: 'Production batch created successfully',
            data: { batch }
        });
    } catch (error) {
        logger.error('Create batch error:', error.message);
        next(error);
    }
};

/**
 * Get all production batches
 */
const getAllBatches = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, mushroomType, productionRoom, startDate, endDate, search } = req.query;
        
        const result = await ProductionService.getAllBatches(
            parseInt(page),
            parseInt(limit),
            { status, mushroomType, productionRoom, startDate, endDate, search }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Production batches retrieved successfully',
            data: result.batches,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get all batches error:', error.message);
        next(error);
    }
};

/**
 * Get production batch by ID
 */
const getBatchById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const batch = await ProductionService.getBatchById(id);
        
        res.status(200).json({
            status: 'success',
            data: { batch }
        });
    } catch (error) {
        logger.error('Get batch by ID error:', error.message);
        next(error);
    }
};

/**
 * Get production batch by batch number
 */
const getBatchByNumber = async (req, res, next) => {
    try {
        const { batchNumber } = req.params;
        const batch = await ProductionService.getBatchByNumber(batchNumber);
        
        res.status(200).json({
            status: 'success',
            data: { batch }
        });
    } catch (error) {
        logger.error('Get batch by number error:', error.message);
        next(error);
    }
};

/**
 * Update production batch
 */
const updateBatch = async (req, res, next) => {
    try {
        const { id } = req.params;
        const batch = await ProductionService.updateBatch(id, req.body, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Production batch updated successfully',
            data: { batch }
        });
    } catch (error) {
        logger.error('Update batch error:', error.message);
        next(error);
    }
};

/**
 * Add harvest to production batch
 */
const addHarvest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ProductionService.addHarvest(id, req.body, req.user.id);
        
        res.status(201).json({
            status: 'success',
            message: 'Harvest recorded successfully',
            data: result
        });
    } catch (error) {
        logger.error('Add harvest error:', error.message);
        next(error);
    }
};

/**
 * Record production loss
 */
const recordLoss = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ProductionService.recordLoss(id, req.body, req.user.id);
        
        res.status(201).json({
            status: 'success',
            message: 'Production loss recorded successfully',
            data: result
        });
    } catch (error) {
        logger.error('Record loss error:', error.message);
        next(error);
    }
};

/**
 * Update batch status
 */
const updateBatchStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                status: 'fail',
                message: 'Status is required'
            });
        }
        
        const batch = await ProductionService.updateBatchStatus(id, status, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Batch status updated successfully',
            data: { batch }
        });
    } catch (error) {
        logger.error('Update batch status error:', error.message);
        next(error);
    }
};

/**
 * Get batch statistics
 */
const getBatchStatistics = async (req, res, next) => {
    try {
        const { id } = req.params;
        const statistics = await ProductionService.getBatchStatistics(id);
        
        res.status(200).json({
            status: 'success',
            data: { statistics }
        });
    } catch (error) {
        logger.error('Get batch statistics error:', error.message);
        next(error);
    }
};

/**
 * Delete production batch
 */
const deleteBatch = async (req, res, next) => {
    try {
        const { id } = req.params;
        await ProductionService.deleteBatch(id, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Production batch deleted successfully'
        });
    } catch (error) {
        logger.error('Delete batch error:', error.message);
        next(error);
    }
};

module.exports = {
    createBatch,
    getAllBatches,
    getBatchById,
    getBatchByNumber,
    updateBatch,
    addHarvest,
    recordLoss,
    updateBatchStatus,
    getBatchStatistics,
    deleteBatch
};