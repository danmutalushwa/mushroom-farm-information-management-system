const express = require('express');
const router = express.Router();
const {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    getCustomerByPhone,
    getCustomerByCode,
    updateCustomer,
    deactivateCustomer,
    activateCustomer,
    deleteCustomer,
    getCustomerPurchaseHistory
} = require('../controllers/customer.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication
router.use(protect);

// Customer routes
router.route('/')
    .get(getAllCustomers)
    .post(restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), createCustomer);

router.get('/phone/:phone', getCustomerByPhone);
router.get('/code/:code', getCustomerByCode);

router.route('/:id')
    .get(getCustomerById)
    .put(restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), updateCustomer)
    .delete(restrictTo(ROLES.ADMIN), deleteCustomer);

router.put('/:id/deactivate', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    deactivateCustomer
);

router.put('/:id/activate', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    activateCustomer
);

router.get('/:id/purchase-history', getCustomerPurchaseHistory);

module.exports = router;