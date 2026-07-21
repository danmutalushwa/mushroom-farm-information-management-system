const express = require('express');
const router = express.Router();
const {
    getAllInvoices,
    getInvoiceById,
    getInvoiceByNumber,
    updateInvoicePdfUrl,
    getInvoiceMetrics
} = require('../controllers/invoice.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/roles');

// Apply authentication globally to all invoice routes
router.use(protect);

// 1. Metrics and Analytics (Placed at the top to prevent route collision with /:id)
router.get('/metrics', restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), getInvoiceMetrics);

// 2. Collection Base Route (Fetch all invoices with filters)
router.get('/', getAllInvoices);

// 3. Search and Dynamic Lookup Routes
router.get('/number/:invoiceNumber', getInvoiceByNumber);
router.get('/:id', getInvoiceById);

// 4. Update Document Metadata (Attach external file URL strings)
router.patch('/:id/pdf', 
    restrictTo(ROLES.ADMIN, ROLES.SALES_OFFICER), 
    updateInvoicePdfUrl
);

module.exports = router;
