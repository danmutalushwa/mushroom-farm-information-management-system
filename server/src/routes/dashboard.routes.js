const express = require('express');
const router = express.Router();
const {
    getAdminDashboard,
    getProductionDashboard,
    getInventoryDashboard,
    getSalesDashboard,
    getFarmWorkerDashboard,   
    getCustomerDashboard      
} = require('../controllers/dashboard.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication
router.use(protect);

// Admin dashboard
router.get('/admin', 
    restrictTo(ROLES.ADMIN),   
    getAdminDashboard
);

// Production supervisor dashboard
router.get('/production', 
    restrictTo(ROLES.ADMIN, ROLES.PRODUCTION_SUPERVISOR),   
    getProductionDashboard
);

// Inventory officer dashboard
router.get('/inventory', 
    restrictTo(ROLES.ADMIN, ROLES.INVENTORY_OFFICER),   
    getInventoryDashboard
);

// Sales officer dashboard
router.get('/sales', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER),   
    getSalesDashboard
);

// Customer dashboard
router.get('/customer', 
    restrictTo(ROLES.ADMIN, ROLES.CUSTOMER),   
    getCustomerDashboard
);

// Farm worker dashboard
router.get('/farm-worker', 
    restrictTo(ROLES.ADMIN, ROLES.FARM_WORKER),   
    getFarmWorkerDashboard
);

module.exports = router;