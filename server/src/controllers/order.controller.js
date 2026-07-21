const OrderService = require('../services/order.service');
const logger = require('../utils/logger');

/**
 * Create a new order
 */
const createOrder = async (req, res, next) => {
    try {
        const order = await OrderService.createOrder(req.body, req.user.id);
        
        res.status(201).json({
            status: 'success',
            message: 'Order created successfully',
            data: { order }
        });
    } catch (error) {
        logger.error('Create order error:', error.message);
        next(error);
    }
};

/**
 * Get all orders
 */
const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, customerId, paymentStatus, search, startDate, endDate } = req.query;
        
        const result = await OrderService.getAllOrders(
            parseInt(page),
            parseInt(limit),
            { status, customerId, paymentStatus, search, startDate, endDate }
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Orders retrieved successfully',
            data: result.orders,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get all orders error:', error.message);
        next(error);
    }
};

/**
 * Get order by ID
 */
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await OrderService.getOrderById(id);
        
        res.status(200).json({
            status: 'success',
            data: { order }
        });
    } catch (error) {
        logger.error('Get order by ID error:', error.message);
        next(error);
    }
};

/**
 * Get order by order number
 */
const getOrderByNumber = async (req, res, next) => {
    try {
        const { orderNumber } = req.params;
        const order = await OrderService.getOrderByNumber(orderNumber);
        
        res.status(200).json({
            status: 'success',
            data: { order }
        });
    } catch (error) {
        logger.error('Get order by number error:', error.message);
        next(error);
    }
};

/**
 * Update order status
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const order = await OrderService.updateOrderStatus(id, status, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Order status updated successfully',
            data: { order }
        });
    } catch (error) {
        logger.error('Update order status error:', error.message);
        next(error);
    }
};

/**
 * Update payment status
 */
const updatePaymentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { paymentStatus, paymentMethod } = req.body;
        
        if (!paymentStatus) {
            return res.status(400).json({
                status: 'fail',
                message: 'Payment status is required'
            });
        }
        
        const order = await OrderService.updatePaymentStatus(
            id, 
            paymentStatus, 
            paymentMethod, 
            req.user.id
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Payment status updated successfully',
            data: { order }
        });
    } catch (error) {
        logger.error('Update payment status error:', error.message);
        next(error);
    }
};

/**
 * Cancel order
 */
const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const order = await OrderService.cancelOrder(id, reason, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Order cancelled successfully',
            data: { order }
        });
    } catch (error) {
        logger.error('Cancel order error:', error.message);
        next(error);
    }
};

/**
 * Delete order
 */
const deleteOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        await OrderService.deleteOrder(id, req.user.id);
        
        res.status(200).json({
            status: 'success',
            message: 'Order deleted successfully'
        });
    } catch (error) {
        logger.error('Delete order error:', error.message);
        next(error);
    }
};

/**
 * Get orders by customer
 */
const getOrdersByCustomer = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await OrderService.getOrdersByCustomer(
            customerId,
            parseInt(page),
            parseInt(limit)
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Customer orders retrieved successfully',
            data: result.orders,
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Get orders by customer error:', error.message);
        next(error);
    }
};

/**
 * Get order statistics
 */
const getOrderStatistics = async (req, res, next) => {
    try {
        const stats = await OrderService.getOrderStatistics();
        
        res.status(200).json({
            status: 'success',
            data: { statistics: stats }
        });
    } catch (error) {
        logger.error('Get order statistics error:', error.message);
        next(error);
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrderByNumber,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    deleteOrder,
    getOrdersByCustomer,
    getOrderStatistics
};