import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.data.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await api.post('/auth/login', { email, password })
      
      const { token, user } = response.data.data
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      
      return { success: true, user }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const hasPermission = (permission) => {
    if (!user) return false
    // Admin has all permissions
    if (user.role === 'Administrator') return true
    
    // Check role-based permissions
    const rolePermissions = {
      'Production Supervisor': [
        'canManageProduction',
        'canManageReports',
        'canAccessDashboard'
      ],
      'Inventory Officer': [
        'canManageInventory',
        'canManageReports',
        'canAccessDashboard'
      ],
      'Sales Officer': [
        'canManageCustomers',
        'canManageOrders',
        'canManageSales',
        'canManageReports',
        'canAccessDashboard'
      ],
      'Farm Worker': [
        'canAccessDashboard'
      ],
      'Customer': [
        'canManageOrders',
        'canAccessDashboard'
      ]
    }
    
    const permissions = rolePermissions[user.role] || []
    return permissions.includes(permission)
  }

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'Administrator',
    isProduction: user?.role === 'Production Supervisor',
    isInventory: user?.role === 'Inventory Officer',
    isSales: user?.role === 'Sales Officer',
    isWorker: user?.role === 'Farm Worker',
    isCustomer: user?.role === 'Customer'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}