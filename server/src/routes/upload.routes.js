const express = require('express');
const router = express.Router();
const {
    uploadSingle,
    uploadProfilePicture,
    uploadProductImage,
    uploadMultiple,
    deleteFile
} = require('../controllers/upload.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { uploadSingle: uploadSingleMiddleware, uploadMultiple: uploadMultipleMiddleware } = require('../middlewares/upload.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication
router.use(protect);

/**
 * Upload single file
 * Handled via multipart form-data key: 'file'
 */
router.post('/single', 
    restrictTo(ROLES.ADMIN, ROLES.PRODUCTION_SUPERVISOR, ROLES.INVENTORY_OFFICER, ROLES.SALES_OFFICER),
    uploadSingleMiddleware('file'),
    uploadSingle
);

/**
 * Upload multiple files
 * Handled via multipart form-data key: 'files' (Max 5 files)
 */
router.post('/multiple', 
    restrictTo(ROLES.ADMIN, ROLES.PRODUCTION_SUPERVISOR, ROLES.INVENTORY_OFFICER, ROLES.SALES_OFFICER),
    uploadMultipleMiddleware('files', 5),
    uploadMultiple
);

/**
 * Upload profile picture
 * Handled via multipart form-data key: 'profilePicture'
 */
router.post('/profile-picture', 
    uploadSingleMiddleware('profilePicture'),
    uploadProfilePicture
);

/**
 * Upload product batch image
 * Handled via multipart form-data key: 'productImage'
 */
router.post('/product/:productId', 
    restrictTo(ROLES.ADMIN, ROLES.INVENTORY_OFFICER),
    uploadSingleMiddleware('productImage'),
    uploadProductImage
);

/**
 * Delete file from Cloudinary
 * FIXED: Uses path-to-regexp v8 wildcard syntax (/*publicId) 
 * This captures nested folder slashes securely without causing 404 or compilation crashes.
 */
router.delete('/*publicId', 
    restrictTo(ROLES.ADMIN),
    deleteFile
);

module.exports = router;
