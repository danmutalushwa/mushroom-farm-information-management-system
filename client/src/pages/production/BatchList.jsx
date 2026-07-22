import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productionAPI } from '../../api/production'
import StatusBadge from '../../components/Common/StatusBadge'
import { MUSHROOM_TYPES, PRODUCTION_STATUS_OPTIONS } from '../../constants'

const BatchList = () => {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    status: '',
    mushroomType: '',
    search: ''
  })

  useEffect(() => {
    fetchBatches()
  }, [filters, pagination.page])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const response = await productionAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        mushroomType: filters.mushroomType,
        search: filters.search
      })
      
      setBatches(response.data.data || [])
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      })
    } catch (error) {
      console.error('Failed to fetch batches:', error)
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
    fetchBatches()
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  const getStatusCount = (status) => {
    return batches.filter(b => b.status === status).length
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Production Batches</h1>
            <p className="text-gray-600 mt-1">Manage your mushroom cultivation runs</p>
          </div>
          <Link
            to="/production/create"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            <i className="fas fa-plus"></i>
            New Batch
          </Link>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {PRODUCTION_STATUS_OPTIONS.map((status) => (
          <div
            key={status.value}
            className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
            onClick={() => setFilters({ ...filters, status: status.value })}
          >
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {getStatusCount(status.value)}
            </p>
          </div>
        ))}
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
              placeholder="Search by batch number..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Status</option>
              {PRODUCTION_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              name="mushroomType"
              value={filters.mushroomType}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Types</option>
              {MUSHROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
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
          {filters.search || filters.status || filters.mushroomType ? (
            <button
              type="button"
              onClick={() => {
                setFilters({ status: '', mushroomType: '', search: '' })
                setPagination({ ...pagination, page: 1 })
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
            >
              <i className="fas fa-times"></i>
            </button>
          ) : null}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-seedling text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No batches found</p>
            <Link
              to="/production/create"
              className="inline-block mt-4 text-emerald-600 hover:underline font-medium"
            >
              Create your first batch
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">Batch Number</th>
                  <th className="px-6 py-3 font-medium">Mushroom Type</th>
                  <th className="px-6 py-3 font-medium">Room</th>
                  <th className="px-6 py-3 font-medium">Spawn Qty</th>
                  <th className="px-6 py-3 font-medium">Harvest</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Start Date</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((batch) => (
                  <tr key={batch._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <Link
                        to={`/production/${batch._id}`}
                        className="font-medium text-emerald-600 hover:underline"
                      >
                        {batch.batchNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3">{batch.mushroomType}</td>
                    <td className="px-6 py-3">{batch.productionRoom}</td>
                    <td className="px-6 py-3">{batch.spawnQuantity} {batch.spawnUnit}</td>
                    <td className="px-6 py-3">{batch.totalHarvest || 0} {batch.harvestUnit}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={batch.status} />
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {new Date(batch.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/production/${batch._id}`}
                        className="text-emerald-600 hover:text-emerald-700 mr-3"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this batch?')) {
                            productionAPI.delete(batch._id).then(() => fetchBatches())
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
        {!loading && batches.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} batches
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

export default BatchList