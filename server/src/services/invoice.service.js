const Invoice = require('../models/Invoice');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');

class InvoiceService {
    /**
     * Get all invoices with advanced sorting, pagination, and filters
     */
    async getAllInvoices(page = 1, limit = 10, filters = {}) {
        const skip = (page - 1) * limit;
        const query = {};

        // Apply search filters
        if (filters.isPaid !== undefined) {
            query.isPaid = filters.isPaid === 'true';
        }
        if (filters.customerId) {
            query.customerId = filters.customerId;
        }
        if (filters.search) {
            query.$or = [
                { invoiceNumber: { $regex: filters.search, $options: 'i' } },
                { customerName: { $regex: filters.search, $options: 'i' } },
                { customerPhone: { $regex: filters.search, $options: 'i' } }
            ];
        }

        // Apply date filtering
        if (filters.startDate && filters.endDate) {
            query.invoiceDate = {
                $gte: new Date(filters.startDate),
                $lte: new Date(filters.endDate)
            };
        }

        const [invoices, total] = await Promise.all([
            Invoice.find(query)
                .sort({ invoiceDate: -1 })
                .skip(skip)
                .limit(limit)
                .populate('saleId', 'paymentStatus totalAmount'),
            Invoice.countDocuments(query)
        ]);

        return {
            invoices,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get an invoice by its unique MongoDB ObjectId
     */
    async getInvoiceById(id) {
        const invoice = await Invoice.findById(id);
        if (!invoice) {
            throw new AppError('Invoice not found', 404);
        }
        return invoice;
    }

    /**
     * Get an invoice by its business string token identifier (INV-XXXX)
     */
    async getInvoiceByNumber(invoiceNumber) {
        const invoice = await Invoice.findOne({ invoiceNumber: invoiceNumber.toUpperCase() });
        if (!invoice) {
            throw new AppError(`Invoice ${invoiceNumber} not found`, 404);
        }
        return invoice;
    }

    /**
     * Link an external storage location (S3, Cloudinary, etc.) to the generated invoice PDF file
     */
    async updateInvoicePdfUrl(id, pdfUrl) {
        const invoice = await Invoice.findByIdAndUpdate(
            id,
            { $set: { pdfUrl } },
            { new: true, runValidators: true }
        );

        if (!invoice) {
            throw new AppError('Invoice not found for attachment update', 404);
        }

        logger.info(`PDF URL attached to invoice: ${invoice.invoiceNumber}`, { invoiceId: id });
        return invoice;
    }

    /**
     * Fetch a swift aggregation report summarizing outstanding mushroom sales capital
     */
    async getInvoiceMetrics() {
        const metrics = await Invoice.aggregate([
            {
                $group: {
                    _id: null,
                    totalInvoiced: { $sum: '$totalAmount' },
                    totalCollected: { $sum: '$amountPaid' },
                    totalOutstanding: { $sum: '$balanceDue' },
                    invoiceCount: { $sum: 1 }
                }
            }
        ]);

        const overdueInvoices = await Invoice.find({
            isPaid: false,
            dueDate: { $lt: new Date() }
        });

        const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

        const summary = metrics[0] || { totalInvoiced: 0, totalCollected: 0, totalOutstanding: 0, invoiceCount: 0 };

        return {
            totalInvoiced: summary.totalInvoiced,
            totalCollected: summary.totalCollected,
            totalOutstanding: summary.totalOutstanding,
            totalOverdue: totalOverdueAmount,
            invoiceCount: summary.invoiceCount,
            overdueCount: overdueInvoices.length
        };
    }
}

module.exports = new InvoiceService();
