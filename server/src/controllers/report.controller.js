const ReportService = require('../services/report.service');
const logger = require('../utils/logger');

/**
 * Get Production Report
 */
const getProductionReport = async (req, res, next) => {
    try {
        const { startDate, endDate, mushroomType, status } = req.query;
        
        const report = await ReportService.getProductionReport(
            startDate,
            endDate,
            { mushroomType, status }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Production report generated successfully',
            data: report
        });
    } catch (error) {
        logger.error('Get production report error:', error.message);
        next(error);
    }
};

/**
 * Get Inventory Report
 */
const getInventoryReport = async (req, res, next) => {
    try {
        const { category, search } = req.query;
        
        const report = await ReportService.getInventoryReport({ category, search });
        
        res.status(200).json({
            status: 'success',
            message: 'Inventory report generated successfully',
            data: report
        });
    } catch (error) {
        logger.error('Get inventory report error:', error.message);
        next(error);
    }
};

/**
 * Get Customer Report
 */
const getCustomerReport = async (req, res, next) => {
    try {
        const { isActive, customerType, search } = req.query;
        
        const report = await ReportService.getCustomerReport({
            isActive,
            customerType,
            search
        });
        
        res.status(200).json({
            status: 'success',
            message: 'Customer report generated successfully',
            data: report
        });
    } catch (error) {
        logger.error('Get customer report error:', error.message);
        next(error);
    }
};

/**
 * Get Order Report
 */
const getOrderReport = async (req, res, next) => {
    try {
        const { startDate, endDate, status, paymentStatus } = req.query;
        
        const report = await ReportService.getOrderReport(
            startDate,
            endDate,
            { status, paymentStatus }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Order report generated successfully',
            data: report
        });
    } catch (error) {
        logger.error('Get order report error:', error.message);
        next(error);
    }
};

/**
 * Get Sales Report
 */
const getSalesReport = async (req, res, next) => {
    try {
        const { startDate, endDate, paymentStatus, paymentMethod } = req.query;
        
        const report = await ReportService.getSalesReport(
            startDate,
            endDate,
            { paymentStatus, paymentMethod }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Sales report generated successfully',
            data: report
        });
    } catch (error) {
        logger.error('Get sales report error:', error.message);
        next(error);
    }
};

/**
 * Get Stock Movement Report
 */
const getStockMovementReport = async (req, res, next) => {
    try {
        const { startDate, endDate, movementType, itemCode } = req.query;
        
        const report = await ReportService.getStockMovementReport(
            startDate,
            endDate,
            { movementType, itemCode }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Stock movement report generated successfully',
            data: report
        });
    } catch (error) {
        logger.error('Get stock movement report error:', error.message);
        next(error);
    }
};

/**
 * Get Financial Summary Report
 */
const getFinancialSummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        
        const report = await ReportService.getFinancialSummary(startDate, endDate);
        
        res.status(200).json({
            status: 'success',
            message: 'Financial summary generated successfully',
            data: report
        });
    } catch (error) {
        logger.error('Get financial summary error:', error.message);
        next(error);
    }
};

module.exports = {
    getProductionReport,
    getInventoryReport,
    getCustomerReport,
    getOrderReport,
    getSalesReport,
    getStockMovementReport,
    getFinancialSummary
};