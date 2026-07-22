import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const ProductionDashboard = () => {
  const [stats, setStats] = useState({
    totalBatches: 0,
    inProgress: 0,
    readyForHarvest: 0,
    completed: 0,
    totalHarvest: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentBatches, setRecentBatches] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Get batches with different statuses
      const [allBatches, inProgress, readyForHarvest, completed] = await Promise.all([
        api.get('/production?limit=1'),
        api.get('/production?status=In%20Progress&limit=1'),
        api.get('/production?status=Ready%20for%20Harvest&limit=1'),
        api.get('/production?status=Completed&limit=1')
      ])

      // Get recent batches
      const recent = await api.get('/production?limit=5&sort=createdAt:desc')

      setStats({
        totalBatches: allBatches.data.pagination?.total || 0,
        inProgress: inProgress.data.pagination?.total || 0,
        readyForHarvest: readyForHarvest.data.pagination?.total || 0,
        completed: completed.data.pagination?.total || 0,
        totalHarvest: 0 // Will be calculated from batch data
      })
      setRecentBatches(recent.data.data || [])
    } catch (error) {
      console.error('Failed to fetch production data:', error)
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
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Production Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your mushroom cultivation runs</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Batches</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalBatches}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Ready for Harvest</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.readyForHarvest}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Recent Batches */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Batches</h3>
          <Link to="/production" className="text-sm text-emerald-600 hover:underline">
            View All
          </Link>
        </div>
        {recentBatches.length === 0 ? (
          <p className="text-gray-500 text-sm">No batches found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Batch Number</th>
                  <th className="pb-2">Mushroom Type</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Start Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBatches.map((batch) => (
                  <tr key={batch._id} className="border-b last:border-0">
                    <td className="py-2 font-medium">
                      <Link to={`/production/${batch._id}`} className="text-emerald-600 hover:underline">
                        {batch.batchNumber}
                      </Link>
                    </td>
                    <td className="py-2">{batch.mushroomType}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        batch.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        batch.status === 'Ready for Harvest' ? 'bg-yellow-100 text-yellow-700' :
                        batch.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-2">{new Date(batch.startDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductionDashboard