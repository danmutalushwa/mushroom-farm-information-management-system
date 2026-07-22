import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reportsAPI } from '../../api/reports'
import { REPORT_TYPES } from '../../constants'

const ReportList = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showReportData, setShowReportData] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    reportType: '',
    search: ''
  })
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [genSuccess, setGenSuccess] = useState('')
  const [reportData, setReportData] = useState(null)
  const [generateParams, setGenerateParams] = useState({
    reportType: 'Production Report',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    mushroomType: '',
    category: '',
    status: '',
    paymentStatus: '',
    customerType: '',
    isActive: '',
    movementType: '',
    search: ''
  })

  useEffect(() => {
    fetchReports()
  }, [filters, pagination.page])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await reportsAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        reportType: filters.reportType,
        search: filters.search
      })
      
      setReports(response.data.data || [])
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      })
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handleParamChange = (e) => {
    const { name, value } = e.target
    setGenerateParams({ ...generateParams, [name]: value })
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    setGenError('')
    setGenSuccess('')

    try {
      let response
      const params = generateParams

      switch (generateParams.reportType) {
        case 'Production Report':
          response = await reportsAPI.generateProduction({
            startDate: params.startDate,
            endDate: params.endDate,
            mushroomType: params.mushroomType
          })
          break
        case 'Inventory Report':
          response = await reportsAPI.generateInventory({
            category: params.category,
            search: params.search
          })
          break
        case 'Customer Report':
          response = await reportsAPI.generateCustomer({
            customerType: params.customerType,
            isActive: params.isActive,
            search: params.search
          })
          break
        case 'Order Report':
          response = await reportsAPI.generateOrder({
            startDate: params.startDate,
            endDate: params.endDate,
            status: params.status
          })
          break
        case 'Sales Report':
          response = await reportsAPI.generateSales({
            startDate: params.startDate,
            endDate: params.endDate,
            paymentStatus: params.paymentStatus
          })
          break
        case 'Stock Movement Report':
          response = await reportsAPI.generateStockMovement({
            startDate: params.startDate,
            endDate: params.endDate,
            movementType: params.movementType
          })
          break
        case 'Financial Summary':
          response = await reportsAPI.generateFinancial({
            startDate: params.startDate,
            endDate: params.endDate
          })
          break
        default:
          throw new Error('Invalid report type')
      }

      setReportData(response.data.data)
      setGenSuccess('Report generated successfully!')
      fetchReports()
    } catch (error) {
      setGenError(error.response?.data?.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setReportData(report.data)
    setShowReportData(true)
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
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
            <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
            <p className="text-gray-600 mt-1">Generate and view reports</p>
          </div>
          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            <i className={`fas ${showGenerateForm ? 'fa-times' : 'fa-plus'}`}></i>
            {showGenerateForm ? 'Close' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Generate Report Form */}
      {showGenerateForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Generate New Report</h3>
          
          {genError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {genError}
            </div>
          )}
          {genSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
              {genSuccess}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type *
              </label>
              <select
                name="reportType"
                value={generateParams.reportType}
                onChange={handleParamChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                required
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={generateParams.startDate}
                  onChange={handleParamChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={generateParams.endDate}
                  onChange={handleParamChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Conditional Filters */}
            {generateParams.reportType === 'Production Report' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mushroom Type
                </label>
                <select
                  name="mushroomType"
                  value={generateParams.mushroomType}
                  onChange={handleParamChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">All Types</option>
                  <option value="Button">Button</option>
                  <option value="Oyster">Oyster</option>
                  <option value="Shiitake">Shiitake</option>
                  <option value="Lion's Mane">Lion's Mane</option>
                  <option value="Enoki">Enoki</option>
                  <option value="Maitake">Maitake</option>
                  <option value="King Oyster">King Oyster</option>
                </select>
              </div>
            )}

            {generateParams.reportType === 'Inventory Report' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={generateParams.category}
                  onChange={handleParamChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">All Categories</option>
                  <option value="Raw Material">Raw Material</option>
                  <option value="Spawn">Spawn</option>
                  <option value="Packaging Material">Packaging Material</option>
                  <option value="Finished Product">Finished Product</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {generateParams.reportType === 'Order Report' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  name="status"
                  value={generateParams.status}
                  onChange={handleParamChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            )}

            {generateParams.reportType === 'Sales Report' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={generateParams.paymentStatus}
                  onChange={handleParamChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={generating}
              className="w-full gradient-bg text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {generating ? <i className="fas fa-spinner fa-spin"></i> : 'Generate Report'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search reports..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              name="reportType"
              value={filters.reportType}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Types</option>
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setFilters({ reportType: '', search: '' })
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
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-file-alt text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No reports found</p>
            <button
              onClick={() => setShowGenerateForm(true)}
              className="inline-block mt-4 text-emerald-600 hover:underline font-medium"
            >
              Generate your first report
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">Report #</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Generated</th>
                  <th className="px-6 py-3 font-medium">Size</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <span className="font-mono text-sm text-gray-600">{report.reportNumber}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {report.reportType}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800">{report.title}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatDate(report.generatedAt)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {report.fileSize ? `${(report.fileSize / 1024).toFixed(1)} KB` : '-'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="text-emerald-600 hover:text-emerald-700 mr-3"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {report.fileUrl && (
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 mr-3"
                        >
                          <i className="fas fa-download"></i>
                        </a>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this report?')) {
                            reportsAPI.delete(report._id).then(() => fetchReports())
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
        {!loading && reports.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
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

      {/* Report Data Modal */}
      {showReportData && reportData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {selectedReport?.title || 'Report Data'}
              </h3>
              <button
                onClick={() => setShowReportData(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="overflow-x-auto">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowReportData(false)}
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

export default ReportList