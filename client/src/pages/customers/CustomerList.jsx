import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { customerAPI } from '../../api/customers'
import StatusBadge from '../../components/Common/StatusBadge'
import { CUSTOMER_TYPE } from '../../constants'

const CustomerList = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    customerType: '',
    isActive: '',
    search: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [filters, pagination.page])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await customerAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        customerType: filters.customerType,
        isActive: filters.isActive,
        search: filters.search
      })
      
      setCustomers(response.data.data || [])
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      })
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCustomers()
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  const toggleCustomerStatus = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await customerAPI.deactivate(id)
      } else {
        await customerAPI.activate(id)
      }
      fetchCustomers()
    } catch (error) {
      alert('Failed to update customer status')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
            <p className="text-gray-600 mt-1">Manage your customer base</p>
          </div>
          <Link
            to="/customers/create"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            <i className="fas fa-user-plus"></i>
            Add Customer
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {customers.filter(c => c.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-600">
            {customers.filter(c => !c.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-emerald-600">
            RWF {customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name, email, or phone..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              name="customerType"
              value={filters.customerType}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Business">Business</option>
              <option value="Wholesaler">Wholesaler</option>
              <option value="Retailer">Retailer</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              name="isActive"
              value={filters.isActive}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No customers found</p>
            <Link
              to="/customers/create"
              className="inline-block mt-4 text-emerald-600 hover:underline font-medium"
            >
              Add your first customer
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Phone</th>
                  <th className="px-6 py-3 font-medium">Orders</th>
                  <th className="px-6 py-3 font-medium">Total Spent</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <span className="font-mono text-sm text-gray-600">{customer.customerCode}</span>
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        to={`/customers/${customer._id}`}
                        className="font-medium text-emerald-600 hover:underline"
                      >
                        {customer.fullName}
                      </Link>
                      {customer.email && (
                        <div className="text-xs text-gray-500">{customer.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {customer.customerType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">{customer.phoneNumber}</td>
                    <td className="px-6 py-3 text-center">{customer.totalOrders || 0}</td>
                    <td className="px-6 py-3 font-medium">
                      RWF {customer.totalSpent?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={customer.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/customers/${customer._id}`}
                        className="text-emerald-600 hover:text-emerald-700 mr-3"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button
                        onClick={() => toggleCustomerStatus(customer._id, customer.isActive)}
                        className={`mr-3 ${customer.isActive ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}`}
                        title={customer.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <i className={`fas ${customer.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this customer?')) {
                            customerAPI.delete(customer._id).then(() => fetchCustomers())
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && customers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
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

export default CustomerList