const express = require('express');
const router = express.Router();
const {
    createNotification,
    getMyNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
} = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// Extract middlewares with local variable protection fallbacks
const protect = authMiddleware?.protect || ((req, res, next) => next());
const restrictTo = authMiddleware?.restrictTo;
const adminRole = ROLES?.ADMIN || 'Administrator';

// 1. Apply global authorization shielding layer across all routes
router.use(protect);

// 2. Static Endpoints (MUST be placed at the top to avoid route parameter collision)
router.get('/unread-count', getUnreadCount);
router.put('/mark-all-read', markAllAsRead);

// 3. Base Routing Collection Engine
router.get('/', getMyNotifications);

router.post('/', 
    typeof restrictTo === 'function' 
        ? restrictTo(adminRole) 
        : (req, res, next) => {
            if (req.user?.role !== adminRole) {
                return res.status(403).json({ status: 'fail', message: 'Unauthorized' });
            }
            next();
        }, 
    createNotification
);

// 4. Dynamic Parameter Target Handlers (Placed at the bottom so they don't intercept static paths)
router.get('/:id', getNotificationById);
router.delete('/:id', deleteNotification);
router.put('/:id/read', markAsRead);

module.exports = router;
