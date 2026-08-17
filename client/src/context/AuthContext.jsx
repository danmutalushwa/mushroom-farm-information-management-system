import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

// 1. Centralized role definitions mirroring your backend precisely
export const ROLES = {
    ADMIN: 'Administrator',
    FARM_MANAGER: 'Farm Manager',
    PRODUCTION_SUPERVISOR: 'Production Supervisor',
    INVENTORY_OFFICER: 'Inventory Officer',
    SALES_OFFICER: 'Sales Officer',
    FARM_WORKER: 'Farm Worker',
    CUSTOMER: 'Customer'  
};

// 2. Client-side Permission Maps mirroring your backend authorization matrices
export const ROLE_PERMISSIONS = {
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
    canManageNotifications: true,
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

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoize logout to clear resources cleanly without re-render dependency issues
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    }, []);

    // Get fresh user database profile values
    const getCurrentUser = useCallback(async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.status === 'success') {
                setUser(response.data.data.user);
            }
        } catch (err) {
            console.error('Failed to get user data:', err);
            if (err.response?.status === 401) {
                logout();
            }
        }
    }, [logout]);

    // Track initialization processes safely on mounting frames
    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        setUser(decoded);
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        await getCurrentUser();
                    }
                } catch (err) {
                    console.error('Invalid token:', err);
                    logout();
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, [token, logout, getCurrentUser]);

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', { email, password });
            
            if (response.data.status === 'success') {
                const { token: newToken, user: userData } = response.data.data;
                
                localStorage.setItem('token', newToken);
                setToken(newToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                setUser(userData);
                
                return { success: true, user: userData };
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Login failed';
            setError(errMsg);
            return { success: false, error: errMsg };
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await api.post('/auth/public-register-customer', userData);
            
            if (response.data.status === 'success') {
                const { token: newToken, user: userDataObj } = response.data.data;
                
                localStorage.setItem('token', newToken);
                setToken(newToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                setUser(userDataObj);
                
                return { success: true, user: userDataObj };
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Registration failed';
            setError(errMsg);
            return { success: false, error: errMsg };
        }
    };

    // FIXED: Standardize role string comparisons to match database structures exactly
    const hasRole = (role) => user?.role === role;
    const isAdmin = () => user?.role === ROLES.ADMIN;
    const isCustomer = () => user?.role === ROLES.CUSTOMER;
    const isAuthenticated = () => !!user && !!token;

    // NEW UTILITY: Check permissions instantly inside dashboard or sidebar files
    const hasPermission = (permissionName) => {
        if (!user?.role) return false;
        const permissions = ROLE_PERMISSIONS[user.role] || {};
        return !!permissions[permissionName];
    };

    const value = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        hasRole,
        isAdmin,
        isCustomer,
        isAuthenticated,
        hasPermission, // Exported to protect UI features
        getCurrentUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
