const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUser,
    deactivateUser,
    activateUser,
    deleteUser,
    updateUserRole
} = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo(ROLES.ADMIN));

// User management routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/role', updateUserRole);
router.put('/:id/deactivate', deactivateUser);
router.put('/:id/activate', activateUser);
router.delete('/:id', deleteUser);

module.exports = router;