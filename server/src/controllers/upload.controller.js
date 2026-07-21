const { 
    uploadFile, 
    uploadImage, 
    uploadProfilePicture: cloudinaryUploadProfilePicture, 
    uploadProductImage: cloudinaryUploadProductImage, 
    deleteFile: cloudinaryDeleteFile 
} = require('../config/cloudinary');
const User = require('../models/User');       
const Product = require('../models/ProductionBatch'); 
const logger = require('../utils/logger');
const fs = require('fs');

/**
 * Upload single file
 */
const uploadSingle = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'No file uploaded'
            });
        }

        const { folder, publicId, resourceType } = req.body;
        
        const result = await uploadFile(req.file.path, {
            folder: folder || 'mushroom-farm/uploads',
            publicId: publicId || null,
            resourceType: resourceType || 'auto'
        });

        // Remove local file after upload
        fs.unlink(req.file.path, (err) => {
            if (err) logger.error('Failed to delete local file:', err.message);
        });

        res.status(200).json({
            status: 'success',
            message: 'File uploaded successfully',
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes,
                width: result.width,
                height: result.height
            }
        });
    } catch (error) {
        // Safe cleanup fallback if the upload process drops out mid-execution
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        logger.error('Upload single error:', error.message);
        next(error);
    }
};

/**
 * Upload profile picture and update User record
 */
const uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'No file uploaded'
            });
        }

        const userId = req.user.id;
        const result = await cloudinaryUploadProfilePicture(req.file.path, userId);

        // Updates user profile picture link directly inside MongoDB
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { profilePicture: result.secure_url } }, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            throw new Error('User record matching your token context was not found');
        }

        // Remove local file after upload
        fs.unlink(req.file.path, (err) => {
            if (err) logger.error('Failed to delete local file:', err.message);
        });

        res.status(200).json({
            status: 'success',
            message: 'Profile picture uploaded and linked successfully',
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                user: updatedUser
            }
        });
    } catch (error) {
        // Safe cleanup fallback if database operation drops out mid-execution
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        logger.error('Upload profile picture error:', error.message);
        next(error);
    }
};

/**
 * Upload product image and update Product item record
 */
const uploadProductImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'No file uploaded'
            });
        }

        const { productId } = req.params;
        const result = await cloudinaryUploadProductImage(req.file.path, productId);

        // Links image string URL onto your farm product collection item
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: { productImage: result.secure_url } }, 
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                status: 'fail',
                message: `Product item with ID '${productId}' was not found`
            });
        }

        // Remove local file after upload
        fs.unlink(req.file.path, (err) => {
            if (err) logger.error('Failed to delete local file:', err.message);
        });

        res.status(200).json({
            status: 'success',
            message: 'Product image uploaded and linked successfully',
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                product: updatedProduct
            }
        });
    } catch (error) {
        // Safe cleanup fallback if database operation drops out mid-execution
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        logger.error('Upload product image error:', error.message);
        next(error);
    }
};

/**
 * Upload multiple files
 */
const uploadMultiple = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'No files uploaded'
            });
        }

        const { folder } = req.body;
        const uploadPromises = req.files.map(file => 
            uploadFile(file.path, {
                folder: folder || 'mushroom-farm/uploads',
                resourceType: 'auto'
            })
        );

        const results = await Promise.all(uploadPromises);

        // Remove local files after upload
        req.files.forEach(file => {
            fs.unlink(file.path, (err) => {
                if (err) logger.error('Failed to delete local file:', err.message);
            });
        });

        const uploadedFiles = results.map(result => ({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes
        }));

        res.status(200).json({
            status: 'success',
            message: 'Files uploaded successfully',
            data: { files: uploadedFiles }
        });
    } catch (error) {
        // Safe cleanup fallback for all files in the array if the multi-upload fails
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, () => {});
            });
        }
        logger.error('Upload multiple error:', error.message);
        next(error);
    }
};

/**
 * Delete file from Cloudinary
 */
const deleteFile = async (req, res, next) => {
    try {
        let { publicId } = req.params;
        
        if (!publicId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Public ID is required'
            });
        }

        // FIXED: Reconstructs string path if path-to-regexp v8 returned an array
        if (Array.isArray(publicId)) {
            publicId = publicId.join('/');
        }

        // Removes leading slashes if they exist
        if (typeof publicId === 'string' && publicId.startsWith('/')) {
            publicId = publicId.substring(1);
        }

        await cloudinaryDeleteFile(publicId);

        res.status(200).json({
            status: 'success',
            message: 'File deleted successfully',
            data: { deletedId: publicId }
        });
    } catch (error) {
        logger.error('Delete file error:', error.message);
        next(error);
    }
};

module.exports = {
    uploadSingle,
    uploadProfilePicture,
    uploadProductImage,
    uploadMultiple,
    deleteFile
};
