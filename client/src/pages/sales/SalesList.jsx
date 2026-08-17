import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { salesAPI } from '../../api/sales'
import StatusBadge from '../../components/Common/StatusBadge'
import { PAYMENT_STATUS_OPTIONS } from '../../constants'

const SalesList = () => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    paymentStatus: '',
    search: ''
  })

  useEffect(() => {
    fetchSales()
    fetchStatistics()
  }, [filters, pagination.page])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const response = await salesAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        paymentStatus: filters.paymentStatus,
        search: filters.search
      })
      
      setSales(response.data.data || [])
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      })
    } catch (error) {
      console.error('Failed to fetch sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await salesAPI.getStatistics()
      const data = response.data.data

      setStatistics({
        totalSales: data.summary?.totalSalesCount || 0,
        totalRevenue: data.summary?.totalRevenue || 0,
        pendingPayments: data.statuses?.Pending || 0,
        completedSales: data.statuses?.Paid || 0

      })
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchSales()
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  const formatCurrency = (amount) => {
    return `RWF ${amount?.toLocaleString() || 0}`
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
            <p className="text-gray-600 mt-1">Track your sales transactions</p>
          </div>
          <Link
            to="/orders"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            <i className="fas fa-cart-plus"></i>
            Create from Order
          </Link>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold text-gray-800">{statistics.totalSales || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(statistics.totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Pending Payments</p>
            <p className="text-2xl font-bold text-yellow-600">{statistics.pendingPayments || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{statistics.completedSales || 0}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by sale number or customer..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Payment Status</option>
              {PAYMENT_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            <i className="fas fa-search mr-2"></i>
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-coins text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No sales found</p>
            <Link
              to="/orders"
              className="inline-block mt-4 text-emerald-600 hover:underline font-medium"
            >
              Create a sale from an order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">Sale #</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Order #</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Paid</th>
                  <th className="px-6 py-3 font-medium">Balance</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <Link
                        to={`/sales/${sale._id}`}
                        className="font-medium text-emerald-600 hover:underline font-mono text-sm"
                      >
                        {sale.saleNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-800">{sale.customerName}</div>
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        to={`/orders/${sale.orderId}`}
                        className="text-blue-600 hover:underline font-mono text-sm"
                      >
                        {sale.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-800">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="px-6 py-3 font-medium text-green-600">
                      {formatCurrency(sale.amountPaid || 0)}
                    </td>
                    <td className="px-6 py-3 font-medium text-red-600">
                      {formatCurrency(sale.balanceDue || sale.totalAmount - (sale.amountPaid || 0))}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={sale.paymentStatus} />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(sale.saleDate || sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/sales/${sale._id}`}
                        className="text-emerald-600 hover:text-emerald-700 mr-3"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      {sale.paymentStatus !== 'Paid' && (
                        <Link
                          to={`/sales/${sale._id}`}
                          className="text-blue-600 hover:text-blue-700"
                          title="Record Payment"
                        >
                          <i className="fas fa-credit-card"></i>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && sales.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} sales
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <span className="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-medium">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesList