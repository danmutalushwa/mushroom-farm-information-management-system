const express = require('express');
const router = express.Router();
const { 
    register, 
    registerCustomer, 
    publicRegisterCustomer, 
    login, 
    getMe, 
    changePassword 
} = require('../controllers/auth.controller');

// Import your authentication middleware token shield
const { protect } = require('../middlewares/auth.middleware');

// =============================================
// PUBLIC ENDPOINTS (No token needed)
// =============================================

// Public login
router.post('/login', login);

// NEW: Public customer registration (for signup page)
router.post('/public-register-customer', publicRegisterCustomer);

// =============================================
// PROTECTED ENDPOINTS (Require authentication)
// =============================================

// Admin-only: Register staff
router.post('/register', protect, register);

// Admin-only: Register customer (creates both Customer and User)
// FIXED: Only admins should be able to create customers from dashboard
router.post('/register-customer', protect, registerCustomer);

// Get current user profile
router.get('/me', protect, getMe);

// Change password
router.put('/change-password', protect, changePassword);

module.exports = router;