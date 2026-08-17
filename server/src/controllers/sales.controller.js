const SalesServiceClass = require('../services/sales.service');
// Instantiate the service class to access its instance methods properly
const SalesService = new SalesServiceClass(); 
const logger = require('../utils/logger');

/**
 * Create sale from order
 */
const createSaleFromOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        
        // Validate orderId
        if (!orderId) {
            return res.status(400).json({
                status: 'error',
                message: 'Order ID is required'
            });
        }
        
        // Normalize payload: handle both 'amountPaid' and 'amount' from client request
        const saleData = {
            ...req.body,
            amountPaid: Number(req.body.amountPaid || req.body.amount || 0)
        };
        
        const result = await SalesService.createSaleFromOrder(orderId, saleData, req.user.id);
        
        res.status(201).json({
            status: 'success',
            message: 'Sale created successfully',
            data: result
        });
    } catch (error) {
        logger.error('Create sale error:', error.message);
        next(error);
    }
};

/**
 * Record payment for sale
 */
const recordPayment = async (req, res, next) => {
    try {
        const { saleId } = req.params;
        
        // Validate saleId
        if (!saleId) {
            return res.status(400).json({
                status: 'error',
                message: 'Sale ID is required'
            });
        }
        
        // Validate amount
        const amount = Number(req.body.amount || req.body.amountPaid);
        if (!amount || amount <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Valid payment amount is required'
            });
        }
        
        // Ensure the service method receives the 'amount' field cleanly
        const paymentData = {
            saleId,
            ...req.body,
            amount: amount
        };
        
        const result = await SalesService.recordPayment(paymentData, req.user.id);
        
        res.status(201).json({
            status: 'success',
            message: 'Payment recorded successfully',
            data: result
        });
    } catch (error) {
        logger.error('Record payment error:', error.message);
        next(error);
    }
};

/**
 * Generate invoice for sale
 */
const generateInvoice = async (req, res, next) => {
    try {
        const { saleId } = req.params;
        
        if (!saleId) {
            return res.status(400).json({
                status: 'error',
                message: 'Sale ID is required'
            });
        }
        
        const invoice = await SalesService.generateInvoice(saleId, req.user.id);
        
        res.status(201).json({
            status: 'success',
            message: 'Invoice generated successfully',
            data: { invoice }
        });
    } catch (error) {
        logger.error('Generate invoice error:', error.message);
        next(error);
    }
};

/**
 * Get all sales
 */
const getAllSales = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, paymentStatus, customerId, search, startDate, endDate } = req.query;
        
        // Validate and sanitize pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        
        const result = await SalesService.getAllSales(
            pageNum,
            limitNum,
            { paymentStatus, customerId, search, startDate, endDate }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Sales retrieved successfully',
            data: result.sales,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get all sales error:', error.message);
        next(error);
    }
};

/**
 * Get sale by ID
 */
const getSaleById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                status: 'error',
                message: 'Sale ID is required'
            });
        }
        
        const sale = await SalesService.getSaleById(id);
        
        res.status(200).json({
            status: 'success',
            data: { sale }
        });
    } catch (error) {
        logger.error('Get sale by ID error:', error.message);
        next(error);
    }
};

/**
 * Get sale by number
 */
const getSaleByNumber = async (req, res, next) => {
    try {
        const { saleNumber } = req.params;
        
        if (!saleNumber) {
            return res.status(400).json({
                status: 'error',
                message: 'Sale number is required'
            });
        }
        
        const sale = await SalesService.getSaleByNumber(saleNumber);
        
        res.status(200).json({
            status: 'success',
            data: { sale }
        });
    } catch (error) {
        logger.error('Get sale by number error:', error.message);
        next(error);
    }
};

/**
 * Get sale payments
 */
const getSalePayments = async (req, res, next) => {
    try {
        const { saleId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        if (!saleId) {
            return res.status(400).json({
                status: 'error',
                message: 'Sale ID is required'
            });
        }
        
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        
        const result = await SalesService.getSalePayments(
            saleId,
            pageNum,
            limitNum
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Payments retrieved successfully',
            data: result.payments,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get sale payments error:', error.message);
        next(error);
    }
};

/**
 * Get sale invoice
 */
const getSaleInvoice = async (req, res, next) => {
    try {
        const { saleId } = req.params;
        
        if (!saleId) {
            return res.status(400).json({
                status: 'error',
                message: 'Sale ID is required'
            });
        }
        
        const invoice = await SalesService.getSaleInvoice(saleId);
        
        res.status(200).json({
            status: 'success',
            data: { invoice }
        });
    } catch (error) {
        logger.error('Get sale invoice error:', error.message);
        next(error);
    }
};

/**
 * Get sales statistics
 */
const getSalesStatistics = async (req, res, next) => {
    try {
        const stats = await SalesService.getSalesStatistics();
        
        res.status(200).json({
            status: 'success',
            data: { statistics: stats }
        });
    } catch (error) {
        logger.error('Get sales statistics error:', error.message);
        next(error);
    }
};

/**
 * DEBUG: Get detailed sales statistics for troubleshooting
 * This endpoint helps identify why total sales might be showing zero
 */
const getSalesStatisticsDebug = async (req, res, next) => {
    try {
        const debugInfo = await SalesService.getSalesStatisticsDebug();
        
        res.status(200).json({
            status: 'debug',
            message: 'Debug information for sales statistics',
            data: debugInfo
        });
    } catch (error) {
        logger.error('Get sales statistics debug error:', error.message);
        next(error);
    }
};

/**
 * Get sales summary (simplified version for dashboard)
 */
const getSalesSummary = async (req, res, next) => {
    try {
        const stats = await SalesService.getSalesStatistics();
        
        // Return simplified summary for dashboard
        res.status(200).json({
            status: 'success',
            data: {
                totalRevenue: stats.summary.totalRevenue,
                totalSalesCount: stats.summary.totalSalesCount,
                totalCollected: stats.summary.totalCollected,
                totalOutstanding: stats.summary.totalOutstanding,
                paymentStatuses: stats.statuses
            }
        });
    } catch (error) {
        logger.error('Get sales summary error:', error.message);
        next(error);
    }
};

module.exports = {
    createSaleFromOrder,
    recordPayment,
    generateInvoice,
    getAllSales,
    getSaleById,
    getSaleByNumber,
    getSalePayments,
    getSaleInvoice,
    getSalesStatistics,
    getSalesStatisticsDebug,  
    getSalesSummary           
};