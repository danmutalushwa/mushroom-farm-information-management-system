/**
 * System Roles
 */
const ROLES = {
    ADMIN: 'Administrator',
    FARM_MANAGER:'Farm Manager',
    PRODUCTION_SUPERVISOR: 'Production Supervisor',
    INVENTORY_OFFICER: 'Inventory Officer',
    SALES_OFFICER: 'Sales Officer',
    FARM_WORKER: 'Farm Worker',
    CUSTOMER: 'Customer'  
};

/**
 * Role Permissions Mapping
 */
const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: {
        canManageUsers: true,
        canManageRoles: true,
        canManageProduction: true,
        canManageInventory: true,
        canManageCustomers: true,
        canManageOrders: true,
        canManageSales: true,
        canManageReports: true,
        canManageSettings: true,
        canViewAuditLogs: true,
        canManageNotifications: true,
        canManageSystem: true,
        canViewAllData: true,
        canAccessDashboard: true
    },
    [ROLES.FARM_MANAGER]: {
    canManageUsers: false,
    canManageRoles: false,
    canManageProduction: true,
    canManageInventory: true,
    canManageCustomers: true,
    canManageOrders: true,
    canManageSales: true,
    canManageReports: true,
    canManageSettings: false,
    canViewAuditLogs: false,
    canManageNotifications: false,
    canManageSystem: false,
    canViewAllData: true,
    canAccessDashboard: true
    },
    [ROLES.PRODUCTION_SUPERVISOR]: {
        canManageUsers: false,
        canManageRoles: false,
        canManageProduction: true,
        canManageInventory: false,
        canManageCustomers: false,
        canManageOrders: false,
        canManageSales: false,
        canManageReports: true,
        canManageSettings: false,
        canViewAuditLogs: false,
        canManageNotifications: false,
        canManageSystem: false,
        canViewAllData: false,
        canAccessDashboard: true
    },
    [ROLES.INVENTORY_OFFICER]: {
        canManageUsers: false,
        canManageRoles: false,
        canManageProduction: false,
        canManageInventory: true,
        canManageCustomers: false,
        canManageOrders: false,
        canManageSales: false,
        canManageReports: true,
        canManageSettings: false,
        canViewAuditLogs: false,
        canManageNotifications: false,
        canManageSystem: false,
        canViewAllData: false,
        canAccessDashboard: true
    },
    [ROLES.SALES_OFFICER]: {
        canManageUsers: false,
        canManageRoles: false,
        canManageProduction: false,
        canManageInventory: false,
        canManageCustomers: true,
        canManageOrders: true,
        canManageSales: true,
        canManageReports: true,
        canManageSettings: false,
        canViewAuditLogs: false,
        canManageNotifications: false,
        canManageSystem: false,
        canViewAllData: false,
        canAccessDashboard: true
    },
    [ROLES.FARM_WORKER]: {
        canManageUsers: false,
        canManageRoles: false,
        canManageProduction: false,
        canManageInventory: false,
        canManageCustomers: false,
        canManageOrders: false,
        canManageSales: false,
        canManageReports: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canManageNotifications: false,
        canManageSystem: false,
        canViewAllData: false,
        canAccessDashboard: true
    },
    [ROLES.CUSTOMER]: {  
        canManageUsers: false,
        canManageRoles: false,
        canManageProduction: false,
        canManageInventory: false,
        canManageCustomers: false,
        canManageOrders: true,
        canManageSales: false,
        canManageReports: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canManageNotifications: false,
        canManageSystem: false,
        canViewAllData: false,
        canAccessDashboard: true
    }
};

/**
 * Get role permissions
 * @param {string} role - Role name
 * @returns {Object} Permissions object
 */
const getRolePermissions = (role) => {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.FARM_WORKER];
};

/**
 * Check if user has specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
const hasPermission = (role, permission) => {
    const permissions = getRolePermissions(role);
    return permissions[permission] || false;
};

module.exports = {
    ROLES,
    ROLE_PERMISSIONS,
    getRolePermissions,
    hasPermission
};