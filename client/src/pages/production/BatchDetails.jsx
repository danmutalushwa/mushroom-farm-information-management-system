import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productionAPI } from '../../api/production'
import StatusBadge from '../../components/Common/StatusBadge'
import { HARVEST_GRADES } from '../../constants'

const BatchDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)
  const [showHarvestForm, setShowHarvestForm] = useState(false)
  const [showLossForm, setShowLossForm] = useState(false)
  const [harvestData, setHarvestData] = useState({
    quantity: '',
    grade: 'A',
    qualityRemarks: ''
  })
  const [lossData, setLossData] = useState({
    lossQuantity: '',
    lossReason: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBatchDetails()
  }, [id])

  const fetchBatchDetails = async () => {
    try {
      setLoading(true)
      const [batchRes, statsRes] = await Promise.all([
        productionAPI.getById(id),
        productionAPI.getStatistics(id)
      ])
      setBatch(batchRes.data.data)
      setStatistics(statsRes.data.data)
    } catch (error) {
      console.error('Failed to fetch batch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHarvestSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await productionAPI.addHarvest(id, {
        ...harvestData,
        quantity: parseFloat(harvestData.quantity)
      })
      setShowHarvestForm(false)
      setHarvestData({ quantity: '', grade: 'A', qualityRemarks: '' })
      fetchBatchDetails()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to record harvest')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLossSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await productionAPI.recordLoss(id, {
        ...lossData,
        lossQuantity: parseFloat(lossData.lossQuantity)
      })
      setShowLossForm(false)
      setLossData({ lossQuantity: '', lossReason: '', description: '' })
      fetchBatchDetails()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to record loss')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (window.confirm(`Change status to "${newStatus}"?`)) {
      try {
        await productionAPI.updateStatus(id, { status: newStatus })
        fetchBatchDetails()
      } catch (error) {
        alert('Failed to update status')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-seedling text-4xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">Batch not found</p>
        <Link to="/production" className="inline-block mt-4 text-emerald-600 hover:underline">
          Back to Batches
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{batch.batchNumber}</h1>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-gray-600 mt-1">{batch.mushroomType} - {batch.productionRoom}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowHarvestForm(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm"
            >
              <i className="fas fa-plus mr-2"></i>
              Record Harvest
            </button>
            <button
              onClick={() => setShowLossForm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Record Loss
            </button>
            <button
              onClick={() => navigate('/production')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Harvest</p>
            <p className="text-2xl font-bold text-gray-800">{statistics.totalHarvest || 0} {batch.harvestUnit}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Loss</p>
            <p className="text-2xl font-bold text-red-600">{statistics.totalLoss || 0} {batch.harvestUnit}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Harvest Count</p>
            <p className="text-2xl font-bold text-gray-800">{statistics.harvestCount || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Yield Efficiency</p>
            <p className="text-2xl font-bold text-emerald-600">
              {statistics.yieldEfficiency ? statistics.yieldEfficiency.toFixed(1) : 0}%
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Batch Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Mushroom Type</label>
                <p className="font-medium text-gray-800">{batch.mushroomType}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Spawn Type</label>
                <p className="font-medium text-gray-800">{batch.spawnType}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Production Room</label>
                <p className="font-medium text-gray-800">{batch.productionRoom}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Spawn Quantity</label>
                <p className="font-medium text-gray-800">{batch.spawnQuantity} {batch.spawnUnit}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Start Date</label>
                <p className="font-medium text-gray-800">{new Date(batch.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Expected Harvest Date</label>
                <p className="font-medium text-gray-800">{new Date(batch.expectedHarvestDate).toLocaleDateString()}</p>
              </div>
              {batch.actualHarvestDate && (
                <div>
                  <label className="text-sm text-gray-500">Actual Harvest Date</label>
                  <p className="font-medium text-gray-800">{new Date(batch.actualHarvestDate).toLocaleDateString()}</p>
                </div>
              )}
              {batch.notes && (
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500">Notes</label>
                  <p className="font-medium text-gray-800">{batch.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Harvest History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
            <h3 className="font-semibold text-gray-800 mb-4">Harvest History</h3>
            {batch.harvests && batch.harvests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2">Grade</th>
                      <th className="pb-2">Quality Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.harvests.map((harvest, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2">{new Date(harvest.harvestDate).toLocaleDateString()}</td>
                        <td className="py-2 font-medium">{harvest.quantity} {batch.harvestUnit}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            harvest.grade === 'A' ? 'bg-green-100 text-green-700' :
                            harvest.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            Grade {harvest.grade}
                          </span>
                        </td>
                        <td className="py-2 text-gray-600">{harvest.qualityRemarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No harvests recorded yet</p>
            )}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Status</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleStatusUpdate('Planned')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                  batch.status === 'Planned' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-calendar mr-2"></i>
                Planned
              </button>
              <button
                onClick={() => handleStatusUpdate('In Progress')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                  batch.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-spinner mr-2"></i>
                In Progress
              </button>
              <button
                onClick={() => handleStatusUpdate('Ready for Harvest')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                  batch.status === 'Ready for Harvest' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-check-circle mr-2"></i>
                Ready for Harvest
              </button>
              <button
                onClick={() => handleStatusUpdate('Completed')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                  batch.status === 'Completed' ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-flag-checkered mr-2"></i>
                Completed
              </button>
              <button
                onClick={() => handleStatusUpdate('Cancelled')}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                  batch.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'hover:bg-red-50 text-red-600'
                }`}
              >
                <i className="fas fa-times-circle mr-2"></i>
                Cancelled
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">{new Date(batch.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium">{new Date(batch.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Harvest Modal */}
      {showHarvestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Record Harvest</h3>
              <button
                onClick={() => setShowHarvestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleHarvestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity ({batch.harvestUnit}) *
                </label>
                <input
                  type="number"
                  value={harvestData.quantity}
                  onChange={(e) => setHarvestData({ ...harvestData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade *
                </label>
                <select
                  value={harvestData.grade}
                  onChange={(e) => setHarvestData({ ...harvestData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                  required
                >
                  {HARVEST_GRADES.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Remarks
                </label>
                <textarea
                  value={harvestData.qualityRemarks}
                  onChange={(e) => setHarvestData({ ...harvestData, qualityRemarks: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                  placeholder="e.g., Excellent quality, good size..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 gradient-bg text-white font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Record Harvest'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowHarvestForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loss Modal */}
      {showLossForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Record Loss</h3>
              <button
                onClick={() => setShowLossForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLossSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loss Quantity ({batch.harvestUnit}) *
                </label>
                <input
                  type="number"
                  value={lossData.lossQuantity}
                  onChange={(e) => setLossData({ ...lossData, lossQuantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loss Reason *
                </label>
                <select
                  value={lossData.lossReason}
                  onChange={(e) => setLossData({ ...lossData, lossReason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                  required
                >
                  <option value="">Select Reason</option>
                  <option value="Contamination">Contamination</option>
                  <option value="Pest">Pest Damage</option>
                  <option value="Disease">Disease</option>
                  <option value="Environmental">Environmental Factors</option>
                  <option value="Harvest">Harvest Damage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={lossData.description}
                  onChange={(e) => setLossData({ ...lossData, description: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                  placeholder="Describe the loss..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Record Loss'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLossForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchDetails