const express = require('express');
const router = express.Router();
const { 
    register, 
    registerCustomer, 
    login, 
    getMe, 
    changePassword 
} = require('../controllers/auth.controller');

// Import your authentication middleware token shield
const { protect } = require('../middlewares/auth.middleware');

// Public endpoints (No token needed to log in)
router.post('/login', login);

// Shielded Endpoints (MUST run "protect" first so req.user gets populated!)
router.post('/register', protect, register);
router.post('/register-customer', protect, registerCustomer); // FIXED: Added protect middleware here
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
