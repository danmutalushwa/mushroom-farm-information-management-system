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
        
        // Normalize payload: handle both 'amountPaid' and 'amount' from client request
        const saleData = {
            ...req.body,
            amountPaid: req.body.amountPaid || req.body.amount || 0
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
        
        // Ensure the service method receives the 'amount' field cleanly
        const paymentData = {
            saleId,
            ...req.body,
            amount: req.body.amount || req.body.amountPaid
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
        
        const result = await SalesService.getAllSales(
            parseInt(page),
            parseInt(limit),
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
        
        const result = await SalesService.getSalePayments(
            saleId,
            parseInt(page),
            parseInt(limit)
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

module.exports = {
    createSaleFromOrder,
    recordPayment,
    generateInvoice,
    getAllSales,
    getSaleById,
    getSaleByNumber,
    getSalePayments,
    getSaleInvoice,
    getSalesStatistics
};
