import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state on mount
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(decoded);
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    // Get current user data
                    getCurrentUser();
                }
            } catch (error) {
                console.error('Invalid token:', error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    // Get current user data
    const getCurrentUser = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.status === 'success') {
                setUser(response.data.data.user);
            }
        } catch (error) {
            console.error('Failed to get user data:', error);
            if (error.response?.status === 401) {
                logout();
            }
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', { email, password });
            
            if (response.data.status === 'success') {
                const { token, user: userData } = response.data.data;
                
                // Store token
                localStorage.setItem('token', token);
                setToken(token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Set user
                setUser(userData);
                
                return { success: true, user: userData };
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
            return { success: false, error: error.response?.data?.message };
        }
    };

    // Register function (public)
    const register = async (userData) => {
        try {
            setError(null);
            const response = await api.post('/auth/public-register-customer', userData);
            
            if (response.data.status === 'success') {
                const { token, user: userData } = response.data.data;
                
                // Store token
                localStorage.setItem('token', token);
                setToken(token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Set user
                setUser(userData);
                
                return { success: true, user: userData };
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
            return { success: false, error: error.response?.data?.message };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    // Check if user has a specific role
    const hasRole = (role) => {
        return user?.role === role;
    };

    // Check if user is admin
    const isAdmin = () => {
        return user?.role === 'admin';
    };

    // Check if user is customer
    const isCustomer = () => {
        return user?.role === 'customer';
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!user && !!token;
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
        getCurrentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;