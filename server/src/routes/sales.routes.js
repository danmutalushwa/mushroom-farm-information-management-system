const express = require('express');
const router = express.Router();
const {
    createSaleFromOrder,
    recordPayment,
    generateInvoice,
    getAllSales,
    getSaleById,
    getSaleByNumber,
    getSalePayments,
    getSaleInvoice,
    getSalesStatistics
} = require('../controllers/sales.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// Apply authentication globally to all sales sub-routes
router.use(protect);

// 1. Static Analytics Paths (Must stay at the top to prevent collision with /:id)
router.get('/statistics', getSalesStatistics);

// 2. Collection & Search Query Paths
router.route('/')
    .get(getAllSales);

router.get('/number/:saleNumber', getSaleByNumber);

// 3. Document Creation Paths
router.post('/order/:orderId', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    createSaleFromOrder
);

// 4. Nested Resource Dynamic Paths (Payments & Invoices)
router.post('/:saleId/payment', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    recordPayment
);

router.get('/:saleId/payments', getSalePayments);

router.post('/:saleId/invoice', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    generateInvoice
);

router.get('/:saleId/invoice', getSaleInvoice);

// 5. Generic ID Lookups (Placed at the bottom as a catch-all for single documents)
router.route('/:id')
    .get(getSaleById);

module.exports = router;
