const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrderByNumber,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    deleteOrder,
    getOrdersByCustomer,
    getOrderStatistics
} = require('../controllers/order.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication
router.use(protect);

// Order statistics (accessible to all authenticated users)
router.get('/statistics', getOrderStatistics);

// Main order routes
router.route('/')
    .get(getAllOrders)
    .post(restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), createOrder);

router.get('/number/:orderNumber', getOrderByNumber);

// Customer orders
router.get('/customer/:customerId', getOrdersByCustomer);

// Individual order routes
router.route('/:id')
    .get(getOrderById)
    .delete(restrictTo(ROLES.ADMIN), deleteOrder);

// Order status update
router.put('/:id/status', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    updateOrderStatus
);

// Payment status update
router.put('/:id/payment', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    updatePaymentStatus
);

// Cancel order
router.put('/:id/cancel', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    cancelOrder
);

module.exports = router;