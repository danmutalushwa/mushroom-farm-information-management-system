const InvoiceService = require('../services/invoice.service');
const logger = require('../utils/logger');

/**
 * Get all invoices with filtering and pagination
 */
const getAllInvoices = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, isPaid, customerId, search, startDate, endDate } = req.query;
        
        const result = await InvoiceService.getAllInvoices(
            parseInt(page),
            parseInt(limit),
            { isPaid, customerId, search, startDate, endDate }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Invoices retrieved successfully',
            data: result.invoices,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get all invoices error:', error.message);
        next(error);
    }
};

/**
 * Get invoice by MongoDB ID
 */
const getInvoiceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const invoice = await InvoiceService.getInvoiceById(id);
        
        res.status(200).json({
            status: 'success',
            data: { invoice }
        });
    } catch (error) {
        logger.error('Get invoice by ID error:', error.message);
        next(error);
    }
};

/**
 * Get invoice by business number (e.g., INV-XXXX)
 */
const getInvoiceByNumber = async (req, res, next) => {
    try {
        const { invoiceNumber } = req.params;
        const invoice = await InvoiceService.getInvoiceByNumber(invoiceNumber);
        
        res.status(200).json({
            status: 'success',
            data: { invoice }
        });
    } catch (error) {
        logger.error('Get invoice by number error:', error.message);
        next(error);
    }
};

/**
 * Update the invoice PDF download URL
 */
const updateInvoicePdfUrl = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { pdfUrl } = req.body;
        
        const invoice = await InvoiceService.updateInvoicePdfUrl(id, pdfUrl);
        
        res.status(200).json({
            status: 'success',
            message: 'Invoice PDF URL updated successfully',
            data: { invoice }
        });
    } catch (error) {
        logger.error('Update invoice PDF URL error:', error.message);
        next(error);
    }
};

/**
 * Get dashboard metrics for invoices
 */
const getInvoiceMetrics = async (req, res, next) => {
    try {
        const metrics = await InvoiceService.getInvoiceMetrics();
        
        res.status(200).json({
            status: 'success',
            data: { metrics }
        });
    } catch (error) {
        logger.error('Get invoice metrics error:', error.message);
        next(error);
    }
};

module.exports = {
    getAllInvoices,
    getInvoiceById,
    getInvoiceByNumber,
    updateInvoicePdfUrl,
    getInvoiceMetrics
};
