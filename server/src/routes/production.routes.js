const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/production.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication
router.use(protect);

// Production batch routes
router.route('/')
    .get(getAllBatches)
    .post(restrictTo(ROLES.ADMIN, ROLES.PRODUCTION_SUPERVISOR), createBatch);

router.get('/number/:batchNumber', getBatchByNumber);

router.route('/:id')
    .get(getBatchById)
    .put(restrictTo(ROLES.ADMIN, ROLES.PRODUCTION_SUPERVISOR), updateBatch)
    .delete(restrictTo(ROLES.ADMIN), deleteBatch);

// Batch status update
router.put('/:id/status', 
    restrictTo(ROLES.ADMIN, ROLES.PRODUCTION_SUPERVISOR), 
    updateBatchStatus
);

// Batch statistics
router.get('/:id/statistics', getBatchStatistics);

// Harvest routes
router.post('/:id/harvest', 
    restrictTo(ROLES.ADMIN, ROLES.PRODUCTION_SUPERVISOR), 
    addHarvest
);

// Production loss routes
router.post('/:id/loss', 
    restrictTo(ROLES.ADMIN, ROLES.PRODUCTION_SUPERVISOR), 
    recordLoss
);

module.exports = router;