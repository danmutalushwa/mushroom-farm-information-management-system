// ============================================
// USER CONSTANTS
// ============================================
export const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended'
}

export const ROLES = {
  ADMIN: 'Administrator',
  FARM_MANAGER:'Farm Manager',
  PRODUCTION_SUPERVISOR: 'Production Supervisor',
  INVENTORY_OFFICER: 'Inventory Officer',
  SALES_OFFICER: 'Sales Officer',
  FARM_WORKER: 'Farm Worker',
  CUSTOMER: 'Customer'
}

export const USER_CREATION_ROLES = [
  ROLES.FARM_MANAGER,
  ROLES.PRODUCTION_SUPERVISOR,
  ROLES.INVENTORY_OFFICER,
  ROLES.SALES_OFFICER,
  ROLES.FARM_WORKER 
]

// ============================================
// ORDER CONSTANTS
// ============================================
export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  READY_FOR_COLLECTION: 'Ready for Collection',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
}

export const ORDER_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  { value: 'Processing', label: 'Processing', color: 'bg-purple-100 text-purple-700' },
  { value: 'Ready for Collection', label: 'Ready for Collection', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'Completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' }
]

// ============================================
// PAYMENT CONSTANTS
// ============================================
export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded'
}

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Partially Paid', label: 'Partially Paid', color: 'bg-orange-100 text-orange-700' },
  { value: 'Paid', label: 'Paid', color: 'bg-green-100 text-green-700' },
  { value: 'Failed', label: 'Failed', color: 'bg-red-100 text-red-700' },
  { value: 'Refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-700' }
]

export const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Mobile Money',
  'Credit Card'
]

// ============================================
// PRODUCTION CONSTANTS
// ============================================
export const PRODUCTION_STATUS = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  READY_FOR_HARVEST: 'Ready for Harvest',
  HARVESTED: 'Harvested',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
}

export const PRODUCTION_STATUS_OPTIONS = [
  { value: 'Planned', label: 'Planned', color: 'bg-blue-100 text-blue-700' },
  { value: 'In Progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Ready for Harvest', label: 'Ready for Harvest', color: 'bg-green-100 text-green-700' },
  { value: 'Harvested', label: 'Harvested', color: 'bg-purple-100 text-purple-700' },
  { value: 'Completed', label: 'Completed', color: 'bg-gray-100 text-gray-700' },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' }
]

export const MUSHROOM_TYPES = [
  'Button',
  'Oyster',
  'Shiitake',
  "Lion's Mane",
  'Enoki',
  'Maitake',
  'King Oyster'
]

export const HARVEST_GRADES = [
  { value: 'A', label: 'A - Premium', color: 'bg-green-100 text-green-700' },
  { value: 'B', label: 'B - Standard', color: 'bg-blue-100 text-blue-700' },
  { value: 'C', label: 'C - Low Grade', color: 'bg-yellow-100 text-yellow-700' }
]

// ============================================
// INVENTORY CONSTANTS
// ============================================
export const INVENTORY_CATEGORIES = [
  'Raw Material',
  'Spawn',
  'Packaging Material',
  'Finished Product',
  'Other'
]

export const UNIT_OF_MEASUREMENT = [
  'kg',
  'g',
  'litre',
  'ml',
  'piece',
  'pack',
  'bag',
  'box',
  'bottle',
  'other'
]

export const STOCK_STATUS = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
  OVERSTOCK: 'Overstock'
}

export const STOCK_STATUS_COLORS = {
  'In Stock': 'bg-green-100 text-green-700',
  'Low Stock': 'bg-yellow-100 text-yellow-700',
  'Out of Stock': 'bg-red-100 text-red-700',
  'Overstock': 'bg-blue-100 text-blue-700'
}

export const STOCK_MOVEMENT_TYPES = {
  STOCK_IN: 'Stock In',
  STOCK_OUT: 'Stock Out',
  ADJUSTMENT: 'Adjustment',
  SALES_DEDUCTION: 'Sales Deduction',
  RETURN: 'Return'
}

// ============================================
// CUSTOMER CONSTANTS
// ============================================
export const CUSTOMER_TYPE = {
  INDIVIDUAL: 'Individual',
  BUSINESS: 'Business',
  WHOLESALER: 'Wholesaler',
  RETAILER: 'Retailer'
}

export const CUSTOMER_TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Business', label: 'Business' },
  { value: 'Wholesaler', label: 'Wholesaler' },
  { value: 'Retailer', label: 'Retailer' }
]

// ============================================
// REPORT CONSTANTS
// ============================================
export const REPORT_TYPES = [
  'Production Report',
  'Inventory Report',
  'Customer Report',
  'Order Report',
  'Sales Report',
  'Financial Report',
  'Stock Movement Report'
]

export const REPORT_FORMATS = ['PDF', 'Excel', 'JSON', 'CSV']

export const REPORT_FREQUENCIES = ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly', 'custom']

// ============================================
// STATUS COLORS (Generic)
// ============================================
export const STATUS_COLORS = {
  // User Status
  'Active': 'text-green-700 bg-green-100',
  'Inactive': 'text-gray-700 bg-gray-100',
  'Suspended': 'text-red-700 bg-red-100',
  
  // Order Status
  'Pending': 'text-yellow-700 bg-yellow-100',
  'Confirmed': 'text-blue-700 bg-blue-100',
  'Processing': 'text-purple-700 bg-purple-100',
  'Ready for Collection': 'text-indigo-700 bg-indigo-100',
  'Completed': 'text-green-700 bg-green-100',
  'Cancelled': 'text-red-700 bg-red-100',
  
  // Payment Status
  'Partially Paid': 'text-orange-700 bg-orange-100',
  'Paid': 'text-green-700 bg-green-100',
  'Failed': 'text-red-700 bg-red-100',
  'Refunded': 'text-gray-700 bg-gray-100',
  
  // Production Status
  'Planned': 'text-blue-700 bg-blue-100',
  'In Progress': 'text-yellow-700 bg-yellow-100',
  'Harvested': 'text-purple-700 bg-purple-100',
  
  // Stock Status
  'Out of Stock': 'text-red-700 bg-red-100',
  'Low Stock': 'text-yellow-700 bg-yellow-100',
  'Overstock': 'text-blue-700 bg-blue-100',
  'In Stock': 'text-green-700 bg-green-100'
}

// ============================================
// PAGINATION CONSTANTS
// ============================================
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
}

// ============================================
// INVENTORY TRANSACTION (Alias for STOCK_MOVEMENT_TYPES)
// ============================================
export const INVENTORY_TRANSACTION = {
  STOCK_IN: 'Stock In',
  STOCK_OUT: 'Stock Out',
  ADJUSTMENT: 'Adjustment'
}