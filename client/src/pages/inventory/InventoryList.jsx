import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { inventoryAPI } from '../../api/inventory'
import StatusBadge from '../../components/Common/StatusBadge'
import { INVENTORY_CATEGORIES, STOCK_STATUS, STOCK_STATUS_COLORS } from '../../constants'

const InventoryList = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    category: '',
    stockStatus: '',
    search: ''
  })
  const [stockStatusMap, setStockStatusMap] = useState({})

  useEffect(() => {
    fetchItems()
  }, [filters, pagination.page])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await inventoryAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        category: filters.category,
        stockStatus: filters.stockStatus,
        search: filters.search
      })
      
      const itemsData = response.data.data || []
      setItems(itemsData)
      
      // Get stock status for each item
      const statuses = {}
      itemsData.forEach(item => {
        const status = item.stockStatus || getStockStatus(item)
        statuses[item._id] = status
      })
      setStockStatusMap(statuses)
      
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      })
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return 'Out of Stock'
    if (item.quantity <= item.minimumStockLevel) return 'Low Stock'
    if (item.maximumStockLevel && item.quantity >= item.maximumStockLevel) return 'Overstock'
    return 'In Stock'
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchItems()
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  const getStatusBadge = (status) => {
    const color = STOCK_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
            <p className="text-gray-600 mt-1">Manage your stock and materials</p>
          </div>
          <Link
            to="/inventory/create"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            <i className="fas fa-plus"></i>
            Add Item
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">In Stock</p>
          <p className="text-2xl font-bold text-green-600">
            {items.filter(i => getStockStatus(i) === 'In Stock').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600">
            {items.filter(i => getStockStatus(i) === 'Low Stock').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {items.filter(i => getStockStatus(i) === 'Out of Stock').length}
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
              placeholder="Search by item name or code..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Categories</option>
              {INVENTORY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              name="stockStatus"
              value={filters.stockStatus}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Stock Status</option>
              {Object.values(STOCK_STATUS).map((status) => (
                <option key={status} value={status}>{status}</option>
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
          <Link
            to="/inventory/low-stock"
            className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition font-medium text-sm flex items-center gap-2"
          >
            <i className="fas fa-exclamation-triangle"></i>
            Low Stock Alert
          </Link>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-box text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No inventory items found</p>
            <Link
              to="/inventory/create"
              className="inline-block mt-4 text-emerald-600 hover:underline font-medium"
            >
              Add your first item
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">Item Code</th>
                  <th className="px-6 py-3 font-medium">Item Name</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Quantity</th>
                  <th className="px-6 py-3 font-medium">Unit</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const status = stockStatusMap[item._id] || getStockStatus(item)
                  return (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3">
                        <span className="font-mono text-sm text-gray-600">{item.itemCode}</span>
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          to={`/inventory/${item._id}`}
                          className="font-medium text-emerald-600 hover:underline"
                        >
                          {item.itemName}
                        </Link>
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium">{item.quantity}</td>
                      <td className="px-6 py-3 text-gray-600">{item.unitOfMeasurement}</td>
                      <td className="px-6 py-3">
                        {getStatusBadge(status)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link
                          to={`/inventory/${item._id}`}
                          className="text-emerald-600 hover:text-emerald-700 mr-3"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this item?')) {
                              inventoryAPI.delete(item._id).then(() => fetchItems())
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && items.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
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

export default InventoryList