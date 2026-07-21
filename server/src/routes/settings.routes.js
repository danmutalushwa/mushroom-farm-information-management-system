const express = require('express');
const router = express.Router();
const {
    getAllSettings,
    getSetting,
    updateSetting,
    createSetting,
    deleteSetting,
    getFarmProfile,
    updateFarmProfile
} = require('../controllers/settings.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication
router.use(protect);

// Farm profile routes (accessible to admin and farm manager)
router.get('/farm-profile', 
    restrictTo(ROLES.ADMIN), 
    getFarmProfile
);

router.put('/farm-profile', 
    restrictTo(ROLES.ADMIN), 
    updateFarmProfile
);

// Settings routes (admin only)
router.use(restrictTo(ROLES.ADMIN));

router.get('/', getAllSettings);
router.post('/', createSetting);
router.get('/:category/:key', getSetting);
router.put('/:category/:key', updateSetting);
router.delete('/:category/:key', deleteSetting);

module.exports = router;