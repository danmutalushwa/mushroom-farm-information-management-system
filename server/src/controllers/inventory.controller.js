const InventoryService = require('../services/inventory.service');
const logger = require('../utils/logger');

/**
 * Create inventory item
 */
const createItem = async (req, res, next) => {
    try {
        const item = await InventoryService.createItem(req.body, req.user.id);
        
        res.status(201).json({
            status: 'success',
            message: 'Inventory item created successfully',
            data: { item }
        });
    } catch (error) {
        logger.error('Create inventory item error:', error.message);
        next(error);
    }
};

/**
 * Get all inventory items
 */
const getAllItems = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, search, stockStatus } = req.query;
        
        const result = await InventoryService.getAllItems(
            parseInt(page),
            parseInt(limit),
            { category, search, stockStatus }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Inventory items retrieved successfully',
            data: result.items,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get all inventory items error:', error.message);
        next(error);
    }
};

/**
 * Get inventory item by ID
 */
const getItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await InventoryService.getItemById(id);
        
        res.status(200).json({
            status: 'success',
            data: { item }
        });
    } catch (error) {
        logger.error('Get inventory item error:', error.message);
        next(error);
    }
};

/**
 * Get inventory item by code
 */
const getItemByCode = async (req, res, next) => {
    try {
        const { itemCode } = req.params;
        const item = await InventoryService.getItemByCode(itemCode);
        
        res.status(200).json({
            status: 'success',
            data: { item }
        });
    } catch (error) {
        logger.error('Get inventory item by code error:', error.message);
        next(error);
    }
};

/**
 * Update inventory item
 */
const updateItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await InventoryService.updateItem(id, req.body, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Inventory item updated successfully',
            data: { item }
        });
    } catch (error) {
        logger.error('Update inventory item error:', error.message);
        next(error);
    }
};

/**
 * Update stock quantity
 */
const updateStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantity, movementType, notes } = req.body;
        
        const result = await InventoryService.updateStock(
            id, 
            parseFloat(quantity), 
            movementType, 
            notes, 
            req.user.id
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Stock updated successfully',
            data: result
        });
    } catch (error) {
        logger.error('Update stock error:', error.message);
        next(error);
    }
};

/**
 * Get stock movements
 */
const getStockMovements = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await InventoryService.getStockMovements(
            id,
            parseInt(page),
            parseInt(limit)
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Stock movements retrieved successfully',
            data: result.movements,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get stock movements error:', error.message);
        next(error);
    }
};

/**
 * Get low stock items
 */
const getLowStockItems = async (req, res, next) => {
    try {
        const items = await InventoryService.getLowStockItems();
        
        res.status(200).json({
            status: 'success',
            message: 'Low stock items retrieved successfully',
            data: { items }
        });
    } catch (error) {
        logger.error('Get low stock items error:', error.message);
        next(error);
    }
};

/**
 * Delete inventory item
 */
const deleteItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        await InventoryService.deleteItem(id, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Inventory item deactivated successfully'
        });
    } catch (error) {
        logger.error('Delete inventory item error:', error.message);
        next(error);
    }
};

module.exports = {
    createItem,
    getAllItems,
    getItemById,
    getItemByCode,
    updateItem,
    updateStock,
    getStockMovements,
    getLowStockItems,
    deleteItem
};