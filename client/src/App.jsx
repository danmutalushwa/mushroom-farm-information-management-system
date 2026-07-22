import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

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
          
          {/* Dashboards */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="dashboard/production" element={<ProductionDashboard />} />
          <Route path="dashboard/inventory" element={<InventoryDashboard />} />
          <Route path="dashboard/sales" element={<SalesDashboard />} />
          <Route path="dashboard/worker" element={<FarmWorkerDashboard />} />
          
          {/* Production */}
          <Route path="production" element={<BatchList />} />
          <Route path="production/create" element={<CreateBatch />} />
          <Route path="production/:id" element={<BatchDetails />} />
          
          {/* Inventory */}
          <Route path="inventory" element={<InventoryList />} />
          <Route path="inventory/create" element={<CreateItem />} />
          <Route path="inventory/:id" element={<ItemDetails />} />
          <Route path="inventory/low-stock" element={<LowStockAlert />} />
          
          {/* Customers */}
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/create" element={<CreateCustomer />} />
          <Route path="customers/:id" element={<CustomerDetails />} />

          {/* Orders */}
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/create" element={<CreateOrder />} />
          <Route path="orders/:id" element={<OrderDetails />} />

          {/* Sales */}
          <Route path="sales" element={<SalesList />} />
          <Route path="sales/create" element={<CreateSale />} />
          <Route path="sales/:id" element={<SaleDetails />} />

          {/* Reports */}
          <Route path="reports" element={<ReportList />} />
          <Route path="reports/schedule" element={<ReportSchedule />} />
          <Route path="reports/templates" element={<ReportTemplates />} />
          
          {/* Notifications */}
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="notifications/create" element={<CreateNotification />} />

          {/* Users */}
          <Route path="users" element={<UserList />} />
          <Route path="users/create" element={<CreateUser />} />
          <Route path="users/:id" element={<UserDetails />} />
          
          {/* Settings */}
          <Route path="settings" element={<FarmProfile />} />
          <Route path="settings/audit" element={<AuditLogs />} />
          
          {/* Profile */}
          <Route path="profile" element={<Profile />} />
          <Route path="profile/change-password" element={<ChangePassword />} />
        </Route>
        
        {/* 404 - Redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App