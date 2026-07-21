const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

/**
 * Cloudinary Configuration
 * For image and file upload management
 */

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'a8qekfla',
    api_key: '438945263379487',
    api_secret: 'OOBOcNv5goj27BiVO5sdeCDfmZs',
    secure: true
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {Object} options - Upload options
 * @returns {Promise} Upload result
 */
const uploadFile = async (filePath, options = {}) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: options.folder || 'mushroom-farm',
            public_id: options.publicId || null,
            overwrite: options.overwrite || true,
            resource_type: options.resourceType || 'auto',
            transformation: options.transformation || [],
            ...options
        });
        
        logger.info(`File uploaded to Cloudinary: ${result.public_id}`, {
            url: result.secure_url,
            size: result.bytes,
            format: result.format
        });
        
        return result;
    } catch (error) {
        logger.error('Cloudinary upload error:', error.message);
        throw error;
    }
};

/**
 * Upload image with optimization
 * @param {string} filePath - Local file path
 * @param {Object} options - Upload options
 * @returns {Promise} Upload result
 */
const uploadImage = async (filePath, options = {}) => {
    const defaultOptions = {
        folder: options.folder || 'mushroom-farm/images',
        resourceType: 'image',
        transformation: [
            { quality: 'auto:best' },
            { fetch_format: 'auto' },
            ...(options.transformation || [])
        ]
    };
    
    return uploadFile(filePath, { ...defaultOptions, ...options });
};

/**
 * Upload profile picture
 * @param {string} filePath - Local file path
 * @param {string} userId - User ID for naming
 * @returns {Promise} Upload result
 */
const uploadProfilePicture = async (filePath, userId) => {
    return uploadImage(filePath, {
        folder: 'mushroom-farm/profiles',
        publicId: `user-${userId}`,
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:best' },
            { fetch_format: 'auto' }
        ]
    });
};

/**
 * Upload product image
 * @param {string} filePath - Local file path
 * @param {string} productId - Product ID for naming
 * @returns {Promise} Upload result
 */
const uploadProductImage = async (filePath, productId) => {
    return uploadImage(filePath, {
        folder: 'mushroom-farm/products',
        publicId: `product-${productId}`,
        transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto:best' },
            { fetch_format: 'auto' }
        ]
    });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise} Delete result
 */
const deleteFile = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info(`File deleted from Cloudinary: ${publicId}`);
        return result;
    } catch (error) {
        logger.error('Cloudinary delete error:', error.message);
        throw error;
    }
};

/**
 * Get file URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} File URL
 */
const getFileUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        ...options
    });
};

/**
 * Get image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation options
 * @returns {string} Image URL
 */
const getImageUrl = (publicId, transformations = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        transformation: [
            { quality: 'auto:best' },
            { fetch_format: 'auto' },
            ...(transformations.transformation || [])
        ],
        ...transformations
    });
};

/**
 * Get thumbnail URL
 * @param {string} publicId - Cloudinary public ID
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {string} Thumbnail URL
 */
const getThumbnailUrl = (publicId, width = 200, height = 200) => {
    return cloudinary.url(publicId, {
        secure: true,
        transformation: [
            { width, height, crop: 'fill', gravity: 'face' },
            { quality: 'auto:best' },
            { fetch_format: 'auto' }
        ]
    });
};

/**
 * Check if Cloudinary is configured
 * @returns {boolean} Configuration status
 */
const isConfigured = () => {
    return !!(process.env.CLOUDINARY_CLOUD_NAME && 
              process.env.CLOUDINARY_API_KEY && 
              process.env.CLOUDINARY_API_SECRET);
};

module.exports = {
    cloudinary,
    uploadFile,
    uploadImage,
    uploadProfilePicture,
    uploadProductImage,
    deleteFile,
    getFileUrl,
    getImageUrl,
    getThumbnailUrl,
    isConfigured
};