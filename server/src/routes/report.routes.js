const express = require('express');
const router = express.Router();
const {
    getProductionReport,
    getInventoryReport,
    getCustomerReport,
    getOrderReport,
    getSalesReport,
    getStockMovementReport,
    getFinancialSummary
} = require('../controllers/report.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication
router.use(protect);

// Report endpoints (accessible to authorized roles)
router.get('/production', 
    restrictTo(ROLES.ADMIN, ROLES.PRODUCTION_SUPERVISOR), 
    getProductionReport
);

router.get('/inventory', 
    restrictTo(ROLES.ADMIN, ROLES.INVENTORY_OFFICER), 
    getInventoryReport
);

router.get('/customers', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    getCustomerReport
);

router.get('/orders', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    getOrderReport
);

router.get('/sales', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    getSalesReport
);

router.get('/stock-movements', 
    restrictTo(ROLES.ADMIN, ROLES.INVENTORY_OFFICER), 
    getStockMovementReport
);

router.get('/financial-summary', 
    restrictTo(ROLES.ADMIN), 
    getFinancialSummary
);

module.exports = router;