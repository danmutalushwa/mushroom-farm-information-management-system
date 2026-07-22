import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const ReportTemplates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      // This would be a real API call
      // const response = await reportsAPI.getTemplates()
      // setTemplates(response.data.data || [])
      setTemplates([])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Report Templates</h1>
            <p className="text-gray-600 mt-1">Manage report templates</p>
          </div>
          <Link
            to="/reports/templates/create"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            <i className="fas fa-plus"></i>
            New Template
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-center py-8">Report templates coming soon...</p>
      </div>
    </div>
  )
}

export default ReportTemplates