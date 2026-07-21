const SettingsService = require('../services/settings.service');
const logger = require('../utils/logger');

/**
 * Get all settings
 */
const getAllSettings = async (req, res, next) => {
    try {
        const { category } = req.query;
        const settings = await SettingsService.getAllSettings(category);
        
        res.status(200).json({
            status: 'success',
            message: 'Settings retrieved successfully',
            data: { settings }
        });
    } catch (error) {
        logger.error('Get all settings error:', error.message);
        next(error);
    }
};

/**
 * Get setting by key
 */
const getSetting = async (req, res, next) => {
    try {
        const { category, key } = req.params;
        const setting = await SettingsService.getSetting(category, key);
        
        res.status(200).json({
            status: 'success',
            data: { setting }
        });
    } catch (error) {
        logger.error('Get setting error:', error.message);
        next(error);
    }
};

/**
 * Update setting
 */
const updateSetting = async (req, res, next) => {
    try {
        const { category, key } = req.params;
        const { value } = req.body;
        
        const setting = await SettingsService.updateSetting(category, key, value, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Setting updated successfully',
            data: { setting }
        });
    } catch (error) {
        logger.error('Update setting error:', error.message);
        next(error);
    }
};

/**
 * Create new setting
 */
const createSetting = async (req, res, next) => {
    try {
        const setting = await SettingsService.createSetting(req.body, req.user.id);
        
        res.status(201).json({
            status: 'success',
            message: 'Setting created successfully',
            data: { setting }
        });
    } catch (error) {
        logger.error('Create setting error:', error.message);
        next(error);
    }
};

/**
 * Delete setting
 */
const deleteSetting = async (req, res, next) => {
    try {
        const { category, key } = req.params;
        await SettingsService.deleteSetting(category, key);
        
        res.status(200).json({
            status: 'success',
            message: 'Setting deleted successfully'
        });
    } catch (error) {
        logger.error('Delete setting error:', error.message);
        next(error);
    }
};

/**
 * Get farm profile
 */
const getFarmProfile = async (req, res, next) => {
    try {
        const profile = await SettingsService.getFarmProfile();
        
        res.status(200).json({
            status: 'success',
            data: { profile }
        });
    } catch (error) {
        logger.error('Get farm profile error:', error.message);
        next(error);
    }
};

/**
 * Update farm profile
 */
const updateFarmProfile = async (req, res, next) => {
    try {
        const profile = await SettingsService.updateFarmProfile(req.body, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Farm profile updated successfully',
            data: { profile }
        });
    } catch (error) {
        logger.error('Update farm profile error:', error.message);
        next(error);
    }
};

module.exports = {
    getAllSettings,
    getSetting,
    updateSetting,
    createSetting,
    deleteSetting,
    getFarmProfile,
    updateFarmProfile
};