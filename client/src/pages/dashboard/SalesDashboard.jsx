import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const SalesDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [sales, orders] = await Promise.all([
        api.get('/sales?limit=1'),
        api.get('/orders?limit=1')
      ])

      // Get pending payments
      const pendingPayments = await api.get('/sales?paymentStatus=Pending&limit=1')
      
      // Get completed orders
      const completedOrders = await api.get('/orders?status=Completed&limit=1')

      setStats({
        totalSales: sales.data.pagination?.total || 0,
        totalRevenue: 0, // Would need to calculate from sales data
        pendingPayments: pendingPayments.data.pagination?.total || 0,
        completedOrders: completedOrders.data.pagination?.total || 0
      })
    } catch (error) {
      console.error('Failed to fetch sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
      </div>
    )
  }

  return (
    <div>
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your sales and revenue</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalSales}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600 mt-1">RWF {stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pending Payments</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingPayments}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Completed Orders</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.completedOrders}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link to="/orders/create" className="p-4 bg-orange-50 rounded-xl text-center hover:bg-orange-100 transition">
            <i className="fas fa-cart-plus text-orange-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">New Order</p>
          </Link>
          <Link to="/sales/create" className="p-4 bg-green-50 rounded-xl text-center hover:bg-green-100 transition">
            <i className="fas fa-file-invoice text-green-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">Create Sale</p>
          </Link>
          <Link to="/reports" className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition">
            <i className="fas fa-chart-bar text-purple-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">View Reports</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SalesDashboard