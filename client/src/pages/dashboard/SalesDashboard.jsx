import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
// ✅ CHANGE: Import salesAPI instead of orderAPI
import { salesAPI } from '../../api/sales'  // <-- Change this import

const SalesDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedOrders: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    paymentStatuses: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // ✅ CHANGE: Use salesAPI instead of orderAPI
      const salesResponse = await salesAPI.getStatistics();
      const salesData = salesResponse.data.data?.statistics || {};
      
      // Get pending payments from sales data
      const pendingCount = salesData.statuses?.['Pending'] || 0;
      const partiallyPaidCount = salesData.statuses?.['Partially Paid'] || 0;
      const totalPending = pendingCount + partiallyPaidCount;

      setStats({
        // ✅ CORRECT: Use totalSalesCount for number of sales
        totalSales: salesData.summary?.totalSalesCount || 0,
        // ✅ CORRECT: Use totalRevenue for the amount
        totalRevenue: salesData.summary?.totalRevenue || 0,
        // ✅ CORRECT: Get pending from sales statuses
        pendingPayments: totalPending,
        // Completed orders = Paid status
        completedOrders: salesData.statuses?.['Paid'] || 0,
        // Additional useful stats
        totalCollected: salesData.summary?.totalCollected || 0,
        totalOutstanding: salesData.summary?.totalOutstanding || 0,
        paymentStatuses: salesData.statuses || {}
      })
    } catch (error) {
      console.error('Failed to fetch sales data:', error)
      // Show error in UI
      setStats({
        totalSales: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        completedOrders: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        paymentStatuses: {}
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return `RWF ${(amount || 0).toLocaleString()}`
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
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Sales Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Track sales, orders and revenue
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Total Sales
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {stats.totalSales}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Total Revenue
          </p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Pending Payments
          </p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {stats.pendingPayments}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Completed Sales
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {stats.completedOrders}
          </p>
        </div>
      </div>

      {/* Additional Stats - New Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Amount Collected
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(stats.totalCollected)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Outstanding Balance
          </p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {formatCurrency(stats.totalOutstanding)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Payment Status
          </p>
          <div className="flex gap-2 mt-1">
            {stats.paymentStatuses?.Paid > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Paid: {stats.paymentStatuses.Paid}
              </span>
            )}
            {stats.paymentStatuses?.['Partially Paid'] > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                Partial: {stats.paymentStatuses['Partially Paid']}
              </span>
            )}
            {stats.paymentStatuses?.Pending > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                Pending: {stats.paymentStatuses.Pending}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link
            to="/orders/create"
            className="p-4 bg-orange-50 rounded-xl text-center hover:bg-orange-100 transition"
          >
            <i className="fas fa-cart-plus text-orange-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">
              New Order
            </p>
          </Link>
          <Link
            to="/sales/create"
            className="p-4 bg-green-50 rounded-xl text-center hover:bg-green-100 transition"
          >
            <i className="fas fa-file-invoice text-green-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">
              Create Sale
            </p>
          </Link>
          <Link
            to="/reports"
            className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition"
          >
            <i className="fas fa-chart-bar text-purple-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">
              View Reports
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SalesDashboard