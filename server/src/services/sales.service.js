const Sale = require('../models/Sale');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');
const { validateSale, validatePayment, validateInvoice } = require('../validators/sales.validator');

class SalesService {
    async createSaleFromOrder(orderId, saleData, userId) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        if (order.status !== 'Completed') {
            throw new AppError('Order must be completed before creating a sale', 400);
        }

        const existingSale = await Sale.findOne({ orderId });
        if (existingSale) {
            throw new AppError('A sale already exists for this order', 400);
        }

        const validation = validateSale({
            orderId,
            items: order.items,
            tax: order.tax,
            discount: order.discount,
            paymentMethod: saleData.paymentMethod
        });
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        const totalAmount = Number(order.totalAmount) || 0;
        
        let sale = await Sale.create({
            orderId: order._id,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            items: order.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                productCode: item.productCode,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
            })),
            subtotal: Number(order.subtotal) || 0,
            tax: Number(order.tax) || 0,
            discount: Number(order.discount) || 0,
            totalAmount: totalAmount,
            amountPaid: 0,
            balanceDue: totalAmount,
            paymentStatus: 'Pending',
            saleDate: saleData.saleDate || new Date(),
            recordedBy: userId,
            notes: saleData.notes || null
        });

        logger.info(`Sale created from order: ${order.orderNumber}`, {
            saleId: sale._id,
            saleNumber: sale.saleNumber,
            orderId: order._id,
            totalAmount: sale.totalAmount,
            recordedBy: userId
        });

        if (saleData.amountPaid && Number(saleData.amountPaid) > 0) {
            const paymentAmount = Math.min(Number(saleData.amountPaid), totalAmount);
            if (paymentAmount > 0) {
                const paymentResult = await this.recordPayment({
                    saleId: sale._id,
                    amount: paymentAmount,
                    paymentMethod: saleData.paymentMethod || 'Cash',
                    notes: 'Initial payment for sale'
                }, userId);
                sale = paymentResult.sale;
            }
        }

        const invoice = await this.generateInvoice(sale._id, userId);

        return { sale, invoice };
    }

    async recordPayment(paymentData, userId) {
        const validation = validatePayment(paymentData);
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        const sale = await Sale.findById(paymentData.saleId);
        if (!sale) {
            throw new AppError('Sale not found', 404);
        }

        const totalAmount = Number(sale.totalAmount) || 0;
        const currentPaid = Number(sale.amountPaid) || 0;
        const remainingBalance = Math.max(0, totalAmount - currentPaid);
        
        if (remainingBalance === 0) {
            throw new AppError('This sale is already fully paid. Balance due is 0.', 400);
        }

        const paymentAmount = Number(paymentData.amount);
        if (paymentAmount > remainingBalance) {
            throw new AppError(
                `Payment amount (${paymentAmount}) exceeds remaining balance (${remainingBalance}). ` +
                `Please enter an amount up to ${remainingBalance}.`, 
                400
            );
        }

        const payment = await Payment.create({
            saleId: sale._id,
            saleNumber: sale.saleNumber,
            customerId: sale.customerId,
            customerName: sale.customerName,
            amount: paymentAmount,
            paymentMethod: paymentData.paymentMethod,
            paymentStatus: 'Paid',
            referenceNumber: paymentData.referenceNumber || null,
            paymentDate: paymentData.paymentDate || new Date(),
            notes: paymentData.notes || null,
            recordedBy: userId
        });

        sale.amountPaid = Math.min(totalAmount, currentPaid + paymentAmount);
        sale.balanceDue = Math.max(0, totalAmount - sale.amountPaid);
        
        if (sale.amountPaid >= totalAmount) {
            sale.paymentStatus = 'Paid';
        } else if (sale.amountPaid > 0) {
            sale.paymentStatus = 'Partially Paid';
        } else {
            sale.paymentStatus = 'Pending';
        }
        await sale.save();

        await Invoice.findOneAndUpdate(
            { saleId: sale._id },
            {
                $set: { 
                    amountPaid: sale.amountPaid,
                    balanceDue: sale.balanceDue, 
                    isPaid: sale.paymentStatus === 'Paid' 
                }
            }
        );

        logger.info(`Payment recorded for sale: ${sale.saleNumber}`, {
            paymentId: payment._id,
            paymentNumber: payment.paymentNumber,
            amount: paymentAmount,
            saleId: sale._id,
            recordedBy: userId
        });

        return { payment, sale };
    }

    async getAllSales(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const filter = {};

        if (filters.paymentStatus) {
            filter.paymentStatus = filters.paymentStatus;
        }
        if (filters.customerId) {
            filter.customerId = filters.customerId;
        }
        if (filters.search) {
            filter.$or = [
                { customerName: { $regex: filters.search, $options: 'i' } },
                { customerPhone: { $regex: filters.search, $options: 'i' } },
                { orderNumber: { $regex: filters.search, $options: 'i' } }
            ];
        }
        if (filters.startDate && filters.endDate) {
            filter.saleDate = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate)
            };
        }

        const [sales, total] = await Promise.all([
            Sale.find(filter)
                .sort({ saleDate: -1 })
                .skip(skip)
                .limit(limit),
            Sale.countDocuments(filter)
        ]);

        return {
            sales,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async generateInvoice(saleId, userId) {
        const validation = validateInvoice({ saleId });
        if (!validation.valid) {
            throw new AppError('Validation failed', 400, validation.errors);
        }

        const sale = await Sale.findById(saleId)
            .populate('customerId', 'fullName phoneNumber email address');
        if (!sale) {
            throw new AppError('Sale not found', 404);
        }

        const existingInvoice = await Invoice.findOne({ saleId });
        if (existingInvoice) {
            return existingInvoice;
        }

        const customer = sale.customerId;
        const totalAmount = Number(sale.totalAmount) || 0;
        const amountPaid = Math.min(Number(sale.amountPaid) || 0, totalAmount);

        const invoice = await Invoice.create({
            saleId: sale._id,
            saleNumber: sale.saleNumber,
            orderId: sale.orderId,
            orderNumber: sale.orderNumber,
            customerId: customer._id,
            customerName: customer.fullName,
            customerPhone: customer.phoneNumber,
            customerEmail: customer.email || null,
            customerAddress: customer.address || null,
            items: sale.items,
            subtotal: Number(sale.subtotal) || 0,
            tax: Number(sale.tax) || 0,
            taxRate: 18,
            discount: Number(sale.discount) || 0,
            totalAmount: totalAmount,
            amountPaid: amountPaid,
            balanceDue: Math.max(0, totalAmount - amountPaid),
            invoiceDate: new Date(),
            isPaid: sale.paymentStatus === 'Paid',
            generatedBy: userId,
            notes: sale.notes || null
        });

        logger.info(`Invoice generated for sale: ${sale.saleNumber}`, {
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            saleId: sale._id,
            generatedBy: userId
        });

        return invoice;
    }

    async getSaleById(id) {
        const sale = await Sale.findById(id);
        if (!sale) {
            throw new AppError('Sale record not found', 404);
        }
        return sale;
    }

    async getSaleByNumber(saleNumber) {
        const sale = await Sale.findOne({ saleNumber });
        if (!sale) {
            throw new AppError(`Sale #${saleNumber} not found`, 404);
        }
        return sale;
    }

    async getSalePayments(saleId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = { saleId };

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .sort({ paymentDate: -1 })
                .skip(skip)
                .limit(limit),
            Payment.countDocuments(query)
        ]);

        return {
            payments,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getSaleInvoice(saleId) {
        const invoice = await Invoice.findOne({ saleId });
        if (!invoice) {
            throw new AppError('Invoice not found for this sale', 404);
        }
        return invoice;
    }

    /**
     * Generate sales statistics - FIXED for overpayments
     */
    async getSalesStatistics() {
        const allSales = await Sale.find({});
        
        logger.info('📊 Total sales in database:', { count: allSales.length });
        
        if (allSales.length === 0) {
            return {
                summary: {
                    totalRevenue: 0,
                    totalCollected: 0,
                    totalOutstanding: 0,
                    totalSalesCount: 0
                },
                statuses: {
                    Paid: 0,
                    'Partially Paid': 0,
                    Pending: 0
                }
            };
        }

        let totalRevenue = 0;
        let totalCollected = 0;
        let totalOutstanding = 0;
        const statusCounts = {
            'Paid': 0,
            'Partially Paid': 0,
            'Pending': 0
        };

        allSales.forEach(sale => {
            const total = Number(sale.totalAmount) || 0;
            const paid = Number(sale.amountPaid) || 0;
            
            // CRITICAL FIX: Cap collected amount at total amount
            const collected = Math.min(paid, total);
            const outstanding = Math.max(0, total - collected);
            
            totalRevenue += total;
            totalCollected += collected;
            totalOutstanding += outstanding;
            
            const status = sale.paymentStatus || 'Pending';
            if (statusCounts[status] !== undefined) {
                statusCounts[status]++;
            } else {
                statusCounts[status] = 1;
            }
        });

        logger.info('💰 Calculated totals:', {
            totalRevenue,
            totalCollected,
            totalOutstanding,
            totalSales: allSales.length
        });

        return {
            summary: {
                totalRevenue: totalRevenue,
                totalCollected: totalCollected,
                totalOutstanding: totalOutstanding,
                totalSalesCount: allSales.length
            },
            statuses: statusCounts
        };
    }

    /**
     * DEBUG: Get detailed statistics
     */
    async getSalesStatisticsDebug() {
        const allSales = await Sale.find({});
        
        let totalRevenue = 0;
        let totalPaid = 0;
        let totalOutstanding = 0;
        
        const salesWithOverpayment = [];
        
        allSales.forEach(sale => {
            const total = Number(sale.totalAmount) || 0;
            const paid = Number(sale.amountPaid) || 0;
            const balance = Number(sale.balanceDue) || 0;
            
            totalRevenue += total;
            totalPaid += paid;
            totalOutstanding += balance;
            
            if (paid > total) {
                salesWithOverpayment.push({
                    saleNumber: sale.saleNumber,
                    totalAmount: total,
                    amountPaid: paid,
                    overpayment: paid - total
                });
            }
        });
        
        return {
            totalSales: allSales.length,
            calculated: {
                totalRevenue: totalRevenue,
                totalPaid: totalPaid,
                totalOutstanding: totalOutstanding,
                correctedCollected: Math.min(totalPaid, totalRevenue),
                correctedOutstanding: Math.max(0, totalRevenue - Math.min(totalPaid, totalRevenue))
            },
            issues: {
                salesWithOverpayment: salesWithOverpayment,
                count: salesWithOverpayment.length
            },
            sampleSale: allSales[0] || null
        };
    }
}

module.exports = SalesService;