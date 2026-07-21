const InventoryItem = require('../models/InventoryItem');
const StockMovement = require('../models/StockMovement');
const { AppError } = require('../middlewares/error.middleware');
const { INVENTORY_TRANSACTION } = require('../config/constants'); 
const logger = require('../utils/logger');
const { validateInventoryItem, validateStockMovement } = require('../validators/inventory.validator');

/**
 * Inventory Service
 * Handles all inventory management business logic
 */
class InventoryService {
    /**
     * Create a new inventory item
     */
    async createItem(itemData, userId) {
        // Validate input
        const validation = validateInventoryItem(itemData);
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        // Check if item name already exists
        const existing = await InventoryItem.findOne({ 
            itemName: { $regex: new RegExp(`^${itemData.itemName}$`, 'i') } 
        });
        if (existing) {
            throw new AppError('Item with this name already exists', 400);
        }

        const item = await InventoryItem.create({
            ...itemData,
            createdBy: userId
        });

        logger.info(`Inventory item created: ${item.itemName}`, {
            itemId: item._id,
            category: item.category,
            createdBy: userId
        });

        return item;
    }

    /**
     * Get all inventory items with pagination and filters
     */
    async getAllItems(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter = { isActive: true };
        if (filters.category) filter.category = filters.category;
        if (filters.search) {
            filter.$or = [
                { itemName: { $regex: filters.search, $options: 'i' } },
                { itemCode: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } }
            ];
        }
        if (filters.stockStatus === 'Low Stock') {
            filter.$expr = { $lte: ['$quantity', '$minimumStockLevel'] };
        } else if (filters.stockStatus === 'Out of Stock') {
            filter.quantity = 0;
        } else if (filters.stockStatus === 'In Stock') {
            filter.$expr = { $gt: ['$quantity', '$minimumStockLevel'] };
        }

        const [items, total] = await Promise.all([
            InventoryItem.find(filter)
                .populate('createdBy', 'fullName email')
                .populate('lastUpdatedBy', 'fullName')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            InventoryItem.countDocuments(filter)
        ]);

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get inventory item by ID
     */
    async getItemById(itemId) {
        const item = await InventoryItem.findById(itemId)
            .populate('createdBy', 'fullName email')
            .populate('lastUpdatedBy', 'fullName');

        if (!item) {
            throw new AppError('Inventory item not found', 404);
        }

        return item;
    }

    /**
     * Get inventory item by item code
     */
    async getItemByCode(itemCode) {
        const item = await InventoryItem.findOne({ itemCode })
            .populate('createdBy', 'fullName email')
            .populate('lastUpdatedBy', 'fullName');

        if (!item) {
            throw new AppError('Inventory item not found', 404);
        }

        return item;
    }

    /**
     * Update inventory item
     */
    async updateItem(itemId, updateData, userId) {
        const item = await InventoryItem.findById(itemId);
        if (!item) {
            throw new AppError('Inventory item not found', 404);
        }

        // Update fields
        const allowedFields = ['itemName', 'category', 'description', 'unitOfMeasurement', 
                               'minimumStockLevel', 'maximumStockLevel', 'supplier', 
                               'unitPrice', 'location', 'notes', 'isActive'];
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                item[field] = updateData[field];
            }
        });

        item.lastUpdatedBy = userId;
        await item.save();

        logger.info(`Inventory item updated: ${item.itemName}`, {
            itemId: item._id,
            updatedBy: userId
        });

        return item;
    }

    /**
     * Update stock quantity with movement tracking
     */
    async updateStock(itemId, quantity, movementType, notes, userId) {
        // Validate movement
        const validation = validateStockMovement({ 
            inventoryItemId: itemId, 
            movementType, 
            quantity 
        });
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        const item = await InventoryItem.findById(itemId);
        if (!item) {
            throw new AppError('Inventory item not found', 404);
        }

        const previousQuantity = item.quantity;
        let newQuantity;

        // 🔽 Cleaned up calculation logic using constants
        switch (movementType) {
            case INVENTORY_TRANSACTION.STOCK_IN: // Evaluates to 'Stock In'
                newQuantity = previousQuantity + quantity;
                break;

            case INVENTORY_TRANSACTION.STOCK_OUT: // Evaluates to 'Stock Out'
                if (quantity > previousQuantity) {
                    throw new AppError(`Insufficient stock. Available: ${previousQuantity}`, 400);
                }
                newQuantity = previousQuantity - quantity;
                break;
                
            case INVENTORY_TRANSACTION.ADJUSTMENT: // Evaluates to 'Adjustment'
                newQuantity = quantity;
                break;
            
            default:
                throw new AppError('Invalid movement type', 400);
        }

        // Update item quantity
        item.quantity = newQuantity;
        item.lastUpdatedBy = userId;
        await item.save();

        // Record stock movement
        const movement = await StockMovement.create({
            inventoryItemId: item._id,
            itemCode: item.itemCode,
            itemName: item.itemName,
            movementType,
            quantity,
            previousQuantity,
            newQuantity,
            notes: notes || null,
            performedBy: userId
        });

        logger.info(`Stock updated: ${item.itemName}`, {
            itemId: item._id,
            movementType,
            quantity,
            previousQuantity,
            newQuantity,
            performedBy: userId
        });

        return {
            item,
            movement
        };
    }

    /**
     * Get stock movements for an item
     */
    async getStockMovements(itemId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        const [movements, total] = await Promise.all([
            StockMovement.find({ inventoryItemId: itemId })
                .populate('performedBy', 'fullName email')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            StockMovement.countDocuments({ inventoryItemId: itemId })
        ]);

        return {
            movements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get low stock items
     */
    async getLowStockItems() {
        const items = await InventoryItem.find({
            isActive: true,
            $expr: { $lte: ['$quantity', '$minimumStockLevel'] }
        }).populate('createdBy', 'fullName');

        return items;
    }

    /**
     * Delete inventory item
     */
    async deleteItem(itemId, userId) {
        const item = await InventoryItem.findById(itemId);
        if (!item) {
            throw new AppError('Inventory item not found', 404);
        }

        // Soft delete (set inactive) instead of hard delete
        item.isActive = false;
        item.lastUpdatedBy = userId;
        await item.save();
    }
}

module.exports = new InventoryService();