import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { settingsAPI } from '../../api/settings'
import StatusBadge from '../../components/Common/StatusBadge'

const AuditLogs = () => {
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    module: '',
    status: '',
    search: ''
  })

  useEffect(() => {
    fetchLogs()
    fetchStatistics()
  }, [filters, pagination.page])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await settingsAPI.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        module: filters.module,
        status: filters.status
      })
      
      setLogs(response.data.data || [])
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      })
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await settingsAPI.getAuditStatistics()
      setStatistics(response.data.data)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  const handleViewDetails = (log) => {
    setSelectedLog(log)
    setShowDetails(true)
  }

  const handleCleanLogs = async () => {
    const days = prompt('Enter number of days to keep (older logs will be deleted):', '30')
    if (days && parseInt(days) > 0) {
      if (window.confirm(`Delete logs older than ${days} days?`)) {
        try {
          await settingsAPI.cleanOldLogs({ daysToKeep: parseInt(days) })
          fetchLogs()
          fetchStatistics()
        } catch (error) {
          alert('Failed to clean logs')
        }
      }
    }
  }

  const getActionColor = (action) => {
    const colors = {
      'Create': 'bg-green-100 text-green-700',
      'Update': 'bg-blue-100 text-blue-700',
      'Delete': 'bg-red-100 text-red-700',
      'Login': 'bg-purple-100 text-purple-700',
      'Logout': 'bg-gray-100 text-gray-700',
      'View': 'bg-yellow-100 text-yellow-700',
      'Export': 'bg-indigo-100 text-indigo-700',
      'Import': 'bg-orange-100 text-orange-700'
    }
    return colors[action] || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
            <p className="text-gray-600 mt-1">View system activity logs</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button
              onClick={handleCleanLogs}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              <i className="fas fa-trash mr-2"></i>
              Clean Logs
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Logs</p>
            <p className="text-2xl font-bold text-gray-800">{statistics.totalLogs || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Success</p>
            <p className="text-2xl font-bold text-green-600">{statistics.successCount || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-red-600">{statistics.failedCount || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Unique Users</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.uniqueUsers || 0}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-48">
            <select
              name="module"
              value={filters.module}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Modules</option>
              <option value="auth">Authentication</option>
              <option value="users">Users</option>
              <option value="production">Production</option>
              <option value="inventory">Inventory</option>
              <option value="customers">Customers</option>
              <option value="orders">Orders</option>
              <option value="sales">Sales</option>
              <option value="reports">Reports</option>
              <option value="settings">Settings</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="error">Error</option>
            </select>
          </div>
          <button
            onClick={() => {
              setFilters({ module: '', status: '' })
              setPagination({ ...pagination, page: 1 })
            }}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-history text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">Log #</th>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Module</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <span className="font-mono text-sm text-gray-600">{log.logNumber}</span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                          {log.userFullName?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm">{log.userFullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">{log.module}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleViewDetails(log)}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
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

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Log Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Log Number</label>
                  <p className="font-mono text-sm">{selectedLog.logNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p><StatusBadge status={selectedLog.status} /></p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">User</label>
                  <p className="font-medium">{selectedLog.userFullName}</p>
                  <p className="text-sm text-gray-500">{selectedLog.userEmail}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <p>{selectedLog.userRole}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Action</label>
                  <p className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Module</label>
                  <p>{selectedLog.module}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500">Description</label>
                  <p className="font-medium">{selectedLog.description}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Method</label>
                  <p>{selectedLog.method}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Endpoint</label>
                  <p className="font-mono text-sm">{selectedLog.endpoint}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">IP Address</label>
                  <p>{selectedLog.ipAddress || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Time</label>
                  <p>{formatDate(selectedLog.createdAt)}</p>
                </div>
                {selectedLog.responseTime && (
                  <div>
                    <label className="text-sm text-gray-500">Response Time</label>
                    <p>{selectedLog.responseTime}ms</p>
                  </div>
                )}
              </div>

              {selectedLog.requestBody && (
                <div>
                  <label className="text-sm text-gray-500">Request Body</label>
                  <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.requestBody, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.changes && (
                <div>
                  <label className="text-sm text-gray-500">Changes</label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLog.changes.before && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Before</p>
                        <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
                          {JSON.stringify(selectedLog.changes.before, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.changes.after && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">After</p>
                        <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
                          {JSON.stringify(selectedLog.changes.after, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedLog.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-red-700">Error</label>
                  <p className="text-red-600">{selectedLog.errorMessage}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditLogs