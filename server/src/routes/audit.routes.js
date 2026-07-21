const express = require('express');
const router = express.Router();
const {
    getAllLogs,
    getLogById,
    getLogsByUser,
    getLogsByModule,
    getAuditStatistics,
    cleanOldLogs
} = require('../controllers/audit.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo(ROLES.ADMIN));

// Audit statistics
router.get('/statistics', getAuditStatistics);

// Clean old logs
router.post('/clean', cleanOldLogs);

// Main audit routes
router.get('/', getAllLogs);

// Logs by user
router.get('/user/:userId', getLogsByUser);

// Logs by module
router.get('/module/:module', getLogsByModule);

// Individual log
router.get('/:id', getLogById);

module.exports = router;