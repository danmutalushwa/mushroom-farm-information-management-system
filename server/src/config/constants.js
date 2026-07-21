const USER_STATUS = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended'
};

const ORDER_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    READY_FOR_COLLECTION: 'Ready for Collection',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
};

const PAYMENT_STATUS = {
    PENDING: 'Pending',
    PARTIALLY_PAID: 'Partially Paid', 
    PAID: 'Paid',
    FAILED: 'Failed',
    REFUNDED: 'Refunded'
};

const PAYMENT_METHODS = [
    'Cash',
    'Bank Transfer',
    'Mobile Money',
    'Credit Card'
];

const PRODUCTION_STATUS = {
    PLANNED: 'Planned',
    IN_PROGRESS: 'In Progress',
    HARVESTED: 'Harvested',
    COMPLETED: 'Completed'
};

const INVENTORY_TRANSACTION = {
    STOCK_IN: 'Stock In',
    STOCK_OUT: 'Stock Out',
    ADJUSTMENT: 'Adjustment'
};

const CUSTOMER_TYPE = {
    INDIVIDUAL: 'Individual',
    BUSINESS: 'Business'
};

const DEFAULT_PAGINATION = {
    PAGE: 1,
    LIMIT: 10,
    MAX_LIMIT: 100
};

const MUSHROOM_TYPES = [
    'Button',
    'Oyster',
    'Shiitake',
    'Lion\'s Mane',
    'Enoki',
    'Maitake',
    'King Oyster' 
];


const REPORT_TYPES = [
    'Production Report',
    'Inventory Report',
    'Customer Report',
    'Order Report',
    'Sales Report',
    'Financial Report',
    'Stock Movement Report'
];

const REPORT_FORMATS = ['PDF', 'Excel', 'JSON', 'CSV'];

const REPORT_FREQUENCIES = ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly', 'custom'];

module.exports = {
    USER_STATUS,
    ORDER_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHODS,
    PRODUCTION_STATUS,
    INVENTORY_TRANSACTION,
    CUSTOMER_TYPE,
    DEFAULT_PAGINATION,
    MUSHROOM_TYPES,
    REPORT_TYPES,
    REPORT_FORMATS,
    REPORT_FREQUENCIES
};
