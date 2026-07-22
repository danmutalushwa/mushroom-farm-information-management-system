import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const FarmWorkerDashboard = () => {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/production?limit=10&sort=createdAt:desc')
      setBatches(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
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
        <h1 className="text-2xl font-bold text-gray-800">Farm Worker Dashboard</h1>
        <p className="text-gray-600 mt-1">Your daily tasks and production updates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-2">Today's Tasks</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <i className="fas fa-check-circle text-green-500"></i>
              <span>Check moisture levels in Room A1</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <i className="fas fa-check-circle text-green-500"></i>
              <span>Harvest Oyster mushrooms (Batch BATCH-260115-1234)</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <i className="fas fa-clock text-yellow-500"></i>
              <span>Prepare spawn for new batch</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-2">Active Batches</h3>
          <div className="space-y-2">
            {batches.slice(0, 3).map((batch) => (
              <div key={batch._id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{batch.batchNumber}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  batch.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                  batch.status === 'Ready for Harvest' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {batch.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Production Batches</h3>
          <Link to="/production" className="text-sm text-emerald-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Batch Number</th>
                <th className="pb-2">Mushroom Type</th>
                <th className="pb-2">Room</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch._id} className="border-b last:border-0">
                  <td className="py-2 font-medium text-emerald-600">{batch.batchNumber}</td>
                  <td className="py-2">{batch.mushroomType}</td>
                  <td className="py-2">{batch.productionRoom}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FarmWorkerDashboard