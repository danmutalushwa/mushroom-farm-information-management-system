const express = require('express');
const router = express.Router();
const {
    createItem,
    getAllItems,
    getItemById,
    getItemByCode,
    updateItem,
    updateStock,
    getStockMovements,
    getLowStockItems,
    deleteItem
} = require('../controllers/inventory.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication
router.use(protect);

// Low stock items (accessible to all authenticated users)
router.get('/low-stock', getLowStockItems);

// Main inventory routes
router.route('/')
    .get(getAllItems)
    .post(restrictTo(ROLES.ADMIN, ROLES.INVENTORY_OFFICER), createItem);

router.get('/code/:itemCode', getItemByCode);

// Item routes
router.route('/:id')
    .get(getItemById)
    .put(restrictTo(ROLES.ADMIN, ROLES.INVENTORY_OFFICER), updateItem)
    .delete(restrictTo(ROLES.ADMIN), deleteItem);

// Stock movement routes
router.put('/:id/stock', 
    restrictTo(ROLES.ADMIN, ROLES.INVENTORY_OFFICER), 
    updateStock
);

router.get('/:id/movements', getStockMovements);

module.exports = router;