const CustomerService = require('../services/customer.service');
const logger = require('../utils/logger');

/**
 * Create a new customer
 */
const createCustomer = async (req, res, next) => {
    try {
        const customer = await CustomerService.createCustomer(req.body, req.user.id);
        
        res.status(201).json({
            status: 'success',
            message: 'Customer created successfully',
            data: { customer }
        });
    } catch (error) {
        logger.error('Create customer error:', error.message);
        next(error);
    }
};

/**
 * Get all customers
 */
const getAllCustomers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, customerType, isActive } = req.query;
        
        const result = await CustomerService.getAllCustomers(
            parseInt(page),
            parseInt(limit),
            { search, customerType, isActive }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Customers retrieved successfully',
            data: result.customers,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get all customers error:', error.message);
        next(error);
    }
};

/**
 * Get customer by ID
 */
const getCustomerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await CustomerService.getCustomerById(id);
        
        res.status(200).json({
            status: 'success',
            data: { customer }
        });
    } catch (error) {
        logger.error('Get customer by ID error:', error.message);
        next(error);
    }
};

/**
 * Get customer by phone number
 */
const getCustomerByPhone = async (req, res, next) => {
    try {
        const { phone } = req.params;
        const customer = await CustomerService.getCustomerByPhone(phone);
        
        res.status(200).json({
            status: 'success',
            data: { customer }
        });
    } catch (error) {
        logger.error('Get customer by phone error:', error.message);
        next(error);
    }
};

/**
 * Get customer by code
 */
const getCustomerByCode = async (req, res, next) => {
    try {
        const { code } = req.params;
        const customer = await CustomerService.getCustomerByCode(code);
        
        res.status(200).json({
            status: 'success',
            data: { customer }
        });
    } catch (error) {
        logger.error('Get customer by code error:', error.message);
        next(error);
    }
};

/**
 * Update customer
 */
const updateCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await CustomerService.updateCustomer(id, req.body, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Customer updated successfully',
            data: { customer }
        });
    } catch (error) {
        logger.error('Update customer error:', error.message);
        next(error);
    }
};

/**
 * Deactivate customer
 */
const deactivateCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await CustomerService.deactivateCustomer(id, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Customer deactivated successfully',
            data: { 
                customer: {
                    id: customer._id,
                    fullName: customer.fullName,
                    phoneNumber: customer.phoneNumber,
                    isActive: customer.isActive
                }
            }
        });
    } catch (error) {
        logger.error('Deactivate customer error:', error.message);
        next(error);
    }
};

/**
 * Activate customer
 */
const activateCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await CustomerService.activateCustomer(id, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Customer activated successfully',
            data: { 
                customer: {
                    id: customer._id,
                    fullName: customer.fullName,
                    phoneNumber: customer.phoneNumber,
                    isActive: customer.isActive
                }
            }
        });
    } catch (error) {
        logger.error('Activate customer error:', error.message);
        next(error);
    }
};

/**
 * Delete customer
 */
const deleteCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        await CustomerService.deleteCustomer(id, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        logger.error('Delete customer error:', error.message);
        next(error);
    }
};

/**
 * Get customer purchase history
 */
const getCustomerPurchaseHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const history = await CustomerService.getCustomerPurchaseHistory(id);
        
        res.status(200).json({
            status: 'success',
            data: { history }
        });
    } catch (error) {
        logger.error('Get customer purchase history error:', error.message);
        next(error);
    }
};

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    getCustomerByPhone,
    getCustomerByCode,
    updateCustomer,
    deactivateCustomer,
    activateCustomer,
    deleteCustomer,
    getCustomerPurchaseHistory
};