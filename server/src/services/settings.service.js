const Settings = require('../models/Settings');
const FarmProfile = require('../models/FarmProfile');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');

/**
 * Settings Service
 * Handles all settings and farm profile management logic
 */
class SettingsService {
    /**
     * Get all settings with optional category filter
     */
    async getAllSettings(category = null) {
        const filter = {};
        if (category) filter.category = category;

        const settings = await Settings.find(filter)
            .sort({ category: 1, key: 1 });

        // Group by category
        const grouped = {};
        settings.forEach(setting => {
            if (!grouped[setting.category]) {
                grouped[setting.category] = [];
            }
            grouped[setting.category].push(setting);
        });

        return {
            grouped,
            all: settings
        };
    }

    /**
     * Get setting by category and key
     * FIXED: Added self-healing fallback to auto-create 'siteName' if missing
     */
    async getSetting(category, key) {
        let setting = await Settings.findOne({ category, key });
        
        // SELF-HEALING BLOCK: Automatically seeds the database if 'siteName' is missing
        if (!setting && category === 'general' && key === 'siteName') {
            setting = await Settings.create({
                category: 'general',
                key: 'siteName',
                value: 'Mushroom Farm Management System',
                displayName: 'Site Name',
                description: 'The primary display name of the application system.',
                dataType: 'string',
                isRequired: true,
                isEditable: true,
                isSystem: true,
                updatedBy: null
            });
            logger.info("Auto-seeded critical missing system default: general.siteName");
            return setting;
        }

        if (!setting) {
            throw new AppError(`Setting '${key}' not found in category '${category}'`, 404);
        }
        return setting;
    }

    /**
     * Get setting value by category and key
     */
    async getSettingValue(category, key) {
        const setting = await this.getSetting(category, key);
        return setting.value;
    }

    /**
     * Create a new setting
     */
    async createSetting(settingData, userId) {
        const { category, key, value, displayName, description, dataType, isRequired, isEditable, options, defaultValue, validation } = settingData;

        // Check if setting already exists
        const existing = await Settings.findOne({ category, key });
        if (existing) {
            throw new AppError(`Setting '${key}' already exists in category '${category}'`, 400);
        }

        const setting = await Settings.create({
            category,
            key,
            value,
            displayName,
            description: description || null,
            dataType: dataType || 'string',
            isRequired: isRequired || false,
            isEditable: isEditable !== undefined ? isEditable : true,
            isSystem: false,
            options: options || [],
            defaultValue: defaultValue || null,
            validation: validation || {},
            updatedBy: userId
        });

        logger.info(`Setting created: ${category}.${key}`, {
            settingId: setting._id,
            createdBy: userId
        });

        return setting;
    }

    /**
     * Update setting value
     */
    async updateSetting(category, key, value, userId) {
        const setting = await Settings.findOne({ category, key });
        if (!setting) {
            throw new AppError(`Setting '${key}' not found in category '${category}'`, 404);
        }

        // Check if setting is editable
        if (!setting.isEditable) {
            throw new AppError(`Setting '${key}' is not editable`, 403);
        }

        // Validate value based on data type
        this.validateSettingValue(setting, value);

        setting.value = value;
        setting.updatedBy = userId;
        await setting.save();

        logger.info(`Setting updated: ${category}.${key}`, {
            settingId: setting._id,
            updatedBy: userId,
            newValue: value
        });

        return setting;
    }

    /**
     * Delete setting
     */
    async deleteSetting(category, key) {
        const setting = await Settings.findOne({ category, key });
        if (!setting) {
            throw new AppError(`Setting '${key}' not found in category '${category}'`, 404);
        }

        // Prevent deletion of system settings
        if (setting.isSystem) {
            throw new AppError(`Cannot delete system setting '${key}'`, 403);
        }

        await Settings.findByIdAndDelete(setting._id);

        logger.info(`Setting deleted: ${category}.${key}`, {
            settingId: setting._id
        });

        return setting;
    }

    /**
     * Validate setting value based on data type
     */
    validateSettingValue(setting, value) {
        const { dataType, validation, isRequired } = setting;

        // Check required
        if (isRequired && (value === undefined || value === null || value === '')) {
            throw new AppError(`Setting '${setting.key}' is required`, 400);
        }

        // Skip validation if value is null/empty and not required
        if (value === undefined || value === null || value === '') {
            return;
        }

        // Validate based on data type
        switch (dataType) {
            case 'string':
                if (typeof value !== 'string') {
                    throw new AppError(`Setting '${setting.key}' must be a string`, 400);
                }
                if (validation?.minLength && value.length < validation.minLength) {
                    throw new AppError(`Setting '${setting.key}' must be at least ${validation.minLength} characters`, 400);
                }
                if (validation?.maxLength && value.length > validation.maxLength) {
                    throw new AppError(`Setting '${setting.key}' cannot exceed ${validation.maxLength} characters`, 400);
                }
                if (validation?.pattern && !new RegExp(validation.pattern).test(value)) {
                    throw new AppError(`Setting '${setting.key}' has invalid format`, 400);
                }
                break;

            case 'number':
                if (typeof value !== 'number' || isNaN(value)) {
                    throw new AppError(`Setting '${setting.key}' must be a number`, 400);
                }
                if (validation?.min !== undefined && value < validation.min) {
                    throw new AppError(`Setting '${setting.key}' must be at least ${validation.min}`, 400);
                }
                if (validation?.max !== undefined && value > validation.max) {
                    throw new AppError(`Setting '${setting.key}' cannot exceed ${validation.max}`, 400);
                }
                break;

            case 'boolean':
                if (typeof value !== 'boolean') {
                    throw new AppError(`Setting '${setting.key}' must be a boolean`, 400);
                }
                break;

            case 'array':
                if (!Array.isArray(value)) {
                    throw new AppError(`Setting '${setting.key}' must be an array`, 400);
                }
                break;

            case 'object':
                if (typeof value !== 'object' || Array.isArray(value) || value === null) {
                    throw new AppError(`Setting '${setting.key}' must be an object`, 400);
                }
                break;

            default:
                break;
        }

        // Check enum options
        if (setting.options && setting.options.length > 0) {
            if (!setting.options.includes(value)) {
                throw new AppError(`Setting '${setting.key}' must be one of: ${setting.options.join(', ')}`, 400);
            }
        }
    }

    /**
     * Get farm profile
     * FIXED: Completed missing curly brackets and function closures cleanly
     */
    async getFarmProfile() {
        let profile = await FarmProfile.findOne();
        
        // Create default profile if none exists
        if (!profile) {
            profile = await FarmProfile.create({
                farmName: 'Mushroom Farm',
                farmCode: 'MF-KGL-01',
                email: 'info@mushroomfarm.com',
                phoneNumber: '+250788000000',
                address: {
                    city: 'Kigali',
                    district: 'Kicukiro',
                    country: 'Rwanda'
                },
                settings: {
                    currency: 'RWF',
                    dateFormat: 'YYYY-MM-DD',
                    timeFormat: 'HH:mm',
                    timezone: 'Africa/Kigali',
                    taxRate: 18,
                    measurementUnit: 'kg'
                }
            });
            logger.info('Default farm profile created successfully');
        }
        return profile;
    }
        /**
     * Update farm profile details
     * FIXED: Added missing method to handle profile updates cleanly
     */
    async updateFarmProfile(profileData, userId) {
        // Fetch the existing profile document
        let profile = await FarmProfile.findOne();
        
        // Fallback: If no profile exists yet, create one using our default seeding logic
        if (!profile) {
            profile = await this.getFarmProfile();
        }

        // Destructure incoming update parameters safely
        const { farmName, email, phoneNumber, address, settings } = profileData;

        // Apply top-level scalar updates if provided
        if (farmName) profile.farmName = farmName;
        if (email) profile.email = email;
        if (phoneNumber) profile.phoneNumber = phoneNumber;

        // Deep merge the address sub-document properties securely
        if (address) {
            profile.address = {
                ...profile.address,
                ...address
            };
        }

        // Deep merge global farm application configuration values
        if (settings) {
            profile.settings = {
                ...profile.settings,
                ...settings
            };
        }

        // Track who made the update modification
        profile.updatedBy = userId;

        // Commit modifications to MongoDB
        await profile.save();

        logger.info('Farm profile updated successfully', {
            updatedBy: userId
        });

        return profile;
    }

}

module.exports = new SettingsService();
