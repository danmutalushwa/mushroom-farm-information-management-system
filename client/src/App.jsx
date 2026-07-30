import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardRouter from './components/DashboardRouter'

// Layout
import Layout from './components/Layout/Layout'

// Auth Pages
import Login from './pages/auth/Login'
import RegisterCustomer from './pages/auth/RegisterCustomer'
import ForgotPassword from './pages/auth/ForgotPassword'

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ProductionDashboard from './pages/dashboard/ProductionDashboard'
import InventoryDashboard from './pages/dashboard/InventoryDashboard'
import SalesDashboard from './pages/dashboard/SalesDashboard'
import FarmWorkerDashboard from './pages/dashboard/FarmWorkerDashboard'

// Production Pages
import BatchList from './pages/production/BatchList'
import CreateBatch from './pages/production/CreateBatch'
import BatchDetails from './pages/production/BatchDetails'

// Inventory Pages
import InventoryList from './pages/inventory/InventoryList'
import CreateItem from './pages/inventory/CreateItem'
import ItemDetails from './pages/inventory/ItemDetails'
import LowStockAlert from './pages/inventory/LowStockAlert'

// Customer Pages
import CustomerList from './pages/customers/CustomerList'
import CreateCustomer from './pages/customers/CreateCustomer'
import CustomerDetails from './pages/customers/CustomerDetails'

// Order Pages
import OrderList from './pages/orders/OrderList'
import CreateOrder from './pages/orders/CreateOrder'
import OrderDetails from './pages/orders/OrderDetails'

// Sales Pages
import SalesList from './pages/sales/SalesList'
import CreateSale from './pages/sales/CreateSale'
import SaleDetails from './pages/sales/SaleDetails'

// Reports Pages
import ReportList from './pages/reports/ReportList'
import ReportSchedule from './pages/reports/ReportSchedule'
import ReportTemplates from './pages/reports/ReportTemplates'

// Notifications Pages
import NotificationCenter from './pages/notifications/NotificationCenter'
import CreateNotification from './pages/notifications/CreateNotification'

// Users Pages
import UserList from './pages/users/UserList'
import CreateUser from './pages/users/CreateUser'
import UserDetails from './pages/users/UserDetails'

// Settings Pages
import FarmProfile from './pages/settings/FarmProfile'
import AuditLogs from './pages/settings/AuditLogs'

// Profile Pages
import Profile from './pages/profile/Profile'
import ChangePassword from './pages/profile/ChangePassword'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register-customer" element={<RegisterCustomer />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboards - Dynamic workspace routing via DashboardRouter */}
          <Route path="dashboard" element={<DashboardRouter />} />
          <Route path="dashboard/production" element={<ProtectedRoute allowedRoles={['Administrator', 'Production Supervisor']}><ProductionDashboard /></ProtectedRoute>} />
          <Route path="dashboard/inventory" element={<ProtectedRoute allowedRoles={['Administrator', 'Inventory Officer']}><InventoryDashboard /></ProtectedRoute>} />
          <Route path="dashboard/sales" element={<ProtectedRoute allowedRoles={['Administrator', 'Sales Officer', 'Customer']}><SalesDashboard /></ProtectedRoute>} />
          <Route path="dashboard/worker" element={<ProtectedRoute allowedRoles={['Administrator', 'Farm Worker']}><FarmWorkerDashboard /></ProtectedRoute>} />
          
          {/* Production Management */}
          <Route path="production" element={<ProtectedRoute allowedRoles={['Administrator', 'Production Supervisor']}><BatchList /></ProtectedRoute>} />
          <Route path="production/create" element={<ProtectedRoute allowedRoles={['Administrator', 'Production Supervisor']}><CreateBatch /></ProtectedRoute>} />
          <Route path="production/:id" element={<ProtectedRoute allowedRoles={['Administrator', 'Production Supervisor']}><BatchDetails /></ProtectedRoute>} />
          
          {/* Inventory Control */}
          <Route path="inventory" element={<ProtectedRoute allowedRoles={['Administrator', 'Inventory Officer']}><InventoryList /></ProtectedRoute>} />
          <Route path="inventory/create" element={<ProtectedRoute allowedRoles={['Administrator', 'Inventory Officer']}><CreateItem /></ProtectedRoute>} />
          <Route path="inventory/:id" element={<ProtectedRoute allowedRoles={['Administrator', 'Inventory Officer']}><ItemDetails /></ProtectedRoute>} />
          <Route path="inventory/low-stock" element={<ProtectedRoute allowedRoles={['Administrator', 'Inventory Officer']}><LowStockAlert /></ProtectedRoute>} />
          
          {/* Customer CRM */}
          <Route path="customers" element={<ProtectedRoute allowedRoles={['Administrator', 'Sales Officer']}><CustomerList /></ProtectedRoute>} />
          <Route path="customers/create" element={<ProtectedRoute allowedRoles={['Administrator', 'Sales Officer']}><CreateCustomer /></ProtectedRoute>} />
          <Route path="customers/:id" element={<ProtectedRoute allowedRoles={['Administrator', 'Sales Officer']}><CustomerDetails /></ProtectedRoute>} />

          {/* Orders Hub */}
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/create" element={<CreateOrder />} />
          <Route path="orders/:id" element={<OrderDetails />} />

          {/* Sales Operations */}
          <Route path="sales" element={<ProtectedRoute allowedRoles={['Administrator', 'Sales Officer']}><SalesList /></ProtectedRoute>} />
          <Route path="sales/create" element={<ProtectedRoute allowedRoles={['Administrator', 'Sales Officer']}><CreateSale /></ProtectedRoute>} />
          <Route path="sales/:id" element={<ProtectedRoute allowedRoles={['Administrator', 'Sales Officer']}><SaleDetails /></ProtectedRoute>} />

          {/* Analytics & Reports */}
          <Route path="reports" element={<ProtectedRoute allowedRoles={['Administrator', 'Production Supervisor', 'Inventory Officer', 'Sales Officer']}><ReportList /></ProtectedRoute>} />
          <Route path="reports/schedule" element={<ProtectedRoute allowedRoles={['Administrator']}><ReportSchedule /></ProtectedRoute>} />
          <Route path="reports/templates" element={<ProtectedRoute allowedRoles={['Administrator']}><ReportTemplates /></ProtectedRoute>} />
          
          {/* Notification System */}
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="notifications/create" element={<ProtectedRoute allowedRoles={['Administrator']}><CreateNotification /></ProtectedRoute>} />

          {/* User & Access Management */}
          <Route path="users" element={<ProtectedRoute allowedRoles={['Administrator']}><UserList /></ProtectedRoute>} />
          <Route path="users/create" element={<ProtectedRoute allowedRoles={['Administrator']}><CreateUser /></ProtectedRoute>} />
          <Route path="users/:id" element={<ProtectedRoute allowedRoles={['Administrator']}><UserDetails /></ProtectedRoute>} />
          
          {/* System Settings & Auditing */}
          <Route path="settings" element={<ProtectedRoute allowedRoles={['Administrator']}><FarmProfile /></ProtectedRoute>} />
          <Route path="settings/audit" element={<ProtectedRoute allowedRoles={['Administrator']}><AuditLogs /></ProtectedRoute>} />
          
          {/* Core Profile Access */}
          <Route path="profile" element={<Profile />} />
          <Route path="profile/change-password" element={<ChangePassword />} />
        </Route>
        
        {/* Fallback Wildcard Router */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
