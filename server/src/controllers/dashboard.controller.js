const DashboardService = require('../services/dashboard.service');
const logger = require('../utils/logger');

/**
 * Get Admin Dashboard
 */
const getAdminDashboard = async (req, res, next) => {
    try {
        const data = await DashboardService.getAdminDashboard();
        
        res.status(200).json({
            status: 'success',
            message: 'Admin dashboard data retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Get admin dashboard error:', error.message);
        next(error);
    }
};

/**
 * Get Production Supervisor Dashboard
 */
const getProductionDashboard = async (req, res, next) => {
    try {
        const data = await DashboardService.getProductionDashboard();
        
        res.status(200).json({
            status: 'success',
            message: 'Production dashboard data retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Get production dashboard error:', error.message);
        next(error);
    }
};

/**
 * Get Inventory Officer Dashboard
 */
const getInventoryDashboard = async (req, res, next) => {
    try {
        const data = await DashboardService.getInventoryDashboard();
        
        res.status(200).json({
            status: 'success',
            message: 'Inventory dashboard data retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Get inventory dashboard error:', error.message);
        next(error);
    }
};

/**
 * Get Sales Officer Dashboard
 */
const getSalesDashboard = async (req, res, next) => {
    try {
        const data = await DashboardService.getSalesDashboard();
        
        res.status(200).json({
            status: 'success',
            message: 'Sales dashboard data retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Get sales dashboard error:', error.message);
        next(error);
    }
};

/**
 * Get Farm Worker Dashboard
 */
const getFarmWorkerDashboard = async (req, res, next) => {
    try {
        const data = await DashboardService.getFarmWorkerDashboard(req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Farm worker dashboard data retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Get farm worker dashboard error:', error.message);
        next(error);
    }
};

/**
 * Get Customer Dashboard
 */
const getCustomerDashboard = async (req, res, next) => {
    try {
        const data = await DashboardService.getCustomerDashboard(req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Customer dashboard data retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Get customer dashboard error:', error.message);
        next(error);
    }
};

module.exports = {
    getAdminDashboard,
    getProductionDashboard,
    getInventoryDashboard,
    getSalesDashboard,
    getFarmWorkerDashboard,   
    getCustomerDashboard      
};