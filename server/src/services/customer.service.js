const Customer = require('../models/Customer');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');
const { validateCustomer } = require('../validators/customer.validator');

/**
 * Customer Service
 * Handles all customer management business logic
 */
class CustomerService {
    /**
     * Create a new customer
     */
    async createCustomer(customerData, userId) {
        // Validate input
        const validation = validateCustomer(customerData);
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        // Check if customer exists by phone number
        const existingCustomer = await Customer.findOne({ 
            phoneNumber: customerData.phoneNumber 
        });
        if (existingCustomer) {
            throw new AppError('Customer with this phone number already exists', 400);
        }

        // Check if customer exists by email (if provided)
        if (customerData.email) {
            const existingByEmail = await Customer.findOne({ 
                email: customerData.email 
            });
            if (existingByEmail) {
                throw new AppError('Customer with this email already exists', 400);
            }
        }

        const customer = await Customer.create({
            ...customerData,
            createdBy: userId
        });

        logger.info(`Customer created: ${customer.fullName}`, {
            customerId: customer._id,
            phoneNumber: customer.phoneNumber,
            createdBy: userId
        });

        return customer;
    }

    /**
     * Get all customers with pagination and filters
     */
    async getAllCustomers(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter = {};
        if (filters.isActive !== undefined) {
            filter.isActive = filters.isActive === 'true';
        }
        if (filters.customerType) {
            filter.customerType = filters.customerType;
        }
        if (filters.search) {
            filter.$or = [
                { fullName: { $regex: filters.search, $options: 'i' } },
                { phoneNumber: { $regex: filters.search, $options: 'i' } },
                { customerCode: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const [customers, total] = await Promise.all([
            Customer.find(filter)
                .populate('createdBy', 'fullName email')
                .populate('updatedBy', 'fullName email')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Customer.countDocuments(filter)
        ]);

        return {
            customers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get customer by ID
     */
    async getCustomerById(customerId) {
        const customer = await Customer.findById(customerId)
            .populate('createdBy', 'fullName email')
            .populate('updatedBy', 'fullName email');

        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        return customer;
    }

    /**
     * Get customer by phone number
     */
    async getCustomerByPhone(phoneNumber) {
        const customer = await Customer.findOne({ phoneNumber })
            .populate('createdBy', 'fullName email');

        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        return customer;
    }

    /**
     * Get customer by customer code
     */
    async getCustomerByCode(customerCode) {
        const customer = await Customer.findOne({ customerCode })
            .populate('createdBy', 'fullName email');

        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        return customer;
    }

    /**
     * Update customer
     */
    async updateCustomer(customerId, updateData, userId) {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        // Validate update data
        const validation = validateCustomer(updateData);
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        // Check phone number uniqueness (if changed)
        if (updateData.phoneNumber && updateData.phoneNumber !== customer.phoneNumber) {
            const existing = await Customer.findOne({ 
                phoneNumber: updateData.phoneNumber,
                _id: { $ne: customerId }
            });
            if (existing) {
                throw new AppError('Phone number already in use by another customer', 400);
            }
        }

        // Check email uniqueness (if changed)
        if (updateData.email && updateData.email !== customer.email) {
            const existing = await Customer.findOne({ 
                email: updateData.email,
                _id: { $ne: customerId }
            });
            if (existing) {
                throw new AppError('Email already in use by another customer', 400);
            }
        }

        // Update fields
        const allowedFields = ['fullName', 'phoneNumber', 'email', 'address', 'customerType', 'isActive', 'notes'];
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                customer[field] = updateData[field];
            }
        });

        customer.updatedBy = userId;
        await customer.save();

        logger.info(`Customer updated: ${customer.fullName}`, {
            customerId: customer._id,
            updatedBy: userId
        });

        return customer;
    }

    /**
     * Update customer purchase statistics
     */
    async updatePurchaseStats(customerId, orderTotal) {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        customer.totalOrders += 1;
        customer.totalSpent += orderTotal;
        customer.totalPurchases += 1;
        customer.lastPurchaseDate = new Date();
        await customer.save();

        return customer;
    }

    /**
     * Deactivate customer
     */
    async deactivateCustomer(customerId, userId) {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        if (!customer.isActive) {
            throw new AppError('Customer is already deactivated', 400);
        }

        customer.isActive = false;
        customer.updatedBy = userId;
        await customer.save();

        logger.info(`Customer deactivated: ${customer.fullName}`, {
            customerId: customer._id,
            deactivatedBy: userId
        });

        return customer;
    }

    /**
     * Activate customer
     */
    async activateCustomer(customerId, userId) {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        if (customer.isActive) {
            throw new AppError('Customer is already active', 400);
        }

        customer.isActive = true;
        customer.updatedBy = userId;
        await customer.save();

        logger.info(`Customer activated: ${customer.fullName}`, {
            customerId: customer._id,
            activatedBy: userId
        });

        return customer;
    }

    /**
     * Delete customer (permanent)
     */
    async deleteCustomer(customerId, userId) {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        await Customer.findByIdAndDelete(customerId);

        logger.info(`Customer deleted: ${customer.fullName}`, {
            customerId: customer._id,
            deletedBy: userId
        });

        return customer;
    }

    /**
     * Get customer purchase history
     */
    async getCustomerPurchaseHistory(customerId) {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        // This will be populated by the Order service
        // For now, return customer stats
        return {
            customerId: customer._id,
            fullName: customer.fullName,
            totalOrders: customer.totalOrders,
            totalSpent: customer.totalSpent,
            totalPurchases: customer.totalPurchases,
            lastPurchaseDate: customer.lastPurchaseDate
        };
    }
}

module.exports = new CustomerService();