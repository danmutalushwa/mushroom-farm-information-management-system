import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reportsAPI } from '../../api/reports'

const ReportSchedule = () => {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      // This would be a real API call
      // const response = await reportsAPI.getSchedules()
      // setSchedules(response.data.data || [])
      setSchedules([])
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
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
            <h1 className="text-2xl font-bold text-gray-800">Report Schedules</h1>
            <p className="text-gray-600 mt-1">Schedule automated reports</p>
          </div>
          <Link
            to="/reports/schedule/create"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            <i className="fas fa-plus"></i>
            New Schedule
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-center py-8">Report scheduling coming soon...</p>
      </div>
    </div>
  )
}

export default ReportSchedule