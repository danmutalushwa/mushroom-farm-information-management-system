import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalInventory: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    lowStockItems: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [batches, inventory, customers, orders, sales] = await Promise.all([
        api.get('/production?limit=1'),
        api.get('/inventory?limit=1'),
        api.get('/customers?limit=1'),
        api.get('/orders?limit=1'),
        api.get('/sales?limit=1')
      ])

      // Get pending orders
      const pendingOrders = await api.get('/orders?status=Pending&limit=1')
      
      // Get low stock items
      const lowStock = await api.get('/inventory/low-stock')

      setStats({
        totalBatches: batches.data.pagination?.total || 0,
        totalInventory: inventory.data.pagination?.total || 0,
        totalCustomers: customers.data.pagination?.total || 0,
        totalOrders: orders.data.pagination?.total || 0,
        totalSales: sales.data.pagination?.total || 0,
        pendingOrders: pendingOrders.data.pagination?.total || 0,
        lowStockItems: lowStock.data.data?.length || 0
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Batches',
      value: stats.totalBatches,
      icon: 'fa-seedling',
      color: 'bg-emerald-500',
      link: '/production'
    },
    {
      title: 'Inventory Items',
      value: stats.totalInventory,
      icon: 'fa-warehouse',
      color: 'bg-blue-500',
      link: '/inventory'
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: 'fa-users',
      color: 'bg-purple-500',
      link: '/customers'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: 'fa-cart-shopping',
      color: 'bg-orange-500',
      link: '/orders'
    },
    {
      title: 'Total Sales',
      value: stats.totalSales,
      icon: 'fa-coins',
      color: 'bg-green-500',
      link: '/sales'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: 'fa-clock',
      color: 'bg-yellow-500',
      link: '/orders?status=Pending'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: 'fa-triangle-exclamation',
      color: 'bg-red-500',
      link: '/inventory/low-stock'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your mushroom farm operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                <i className={`fas ${card.icon}`}></i>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/production/create" className="p-4 bg-emerald-50 rounded-xl text-center hover:bg-emerald-100 transition">
            <i className="fas fa-plus-circle text-emerald-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">New Batch</p>
          </Link>
          <Link to="/inventory/create" className="p-4 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition">
            <i className="fas fa-box text-blue-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">Add Item</p>
          </Link>
          <Link to="/customers/create" className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition">
            <i className="fas fa-user-plus text-purple-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">New Customer</p>
          </Link>
          <Link to="/orders/create" className="p-4 bg-orange-50 rounded-xl text-center hover:bg-orange-100 transition">
            <i className="fas fa-cart-plus text-orange-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">New Order</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard