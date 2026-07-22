import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { inventoryAPI } from '../../api/inventory'
import { STOCK_STATUS_COLORS } from '../../constants'

const ItemDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showStockForm, setShowStockForm] = useState(false)
  const [stockData, setStockData] = useState({
    quantity: '',
    movementType: 'Stock In',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchItemDetails()
  }, [id])

  const fetchItemDetails = async () => {
    try {
      setLoading(true)
      const [itemRes, movementsRes] = await Promise.all([
        inventoryAPI.getById(id),
        inventoryAPI.getMovements(id)
      ])
      setItem(itemRes.data.data)
      setMovements(movementsRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStockSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await inventoryAPI.updateStock(id, {
        ...stockData,
        quantity: parseFloat(stockData.quantity)
      })
      setShowStockForm(false)
      setStockData({ quantity: '', movementType: 'Stock In', notes: '' })
      fetchItemDetails()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update stock')
    } finally {
      setSubmitting(false)
    }
  }

  const getStockStatus = (item) => {
    if (!item) return 'Unknown'
    if (item.quantity <= 0) return 'Out of Stock'
    if (item.quantity <= item.minimumStockLevel) return 'Low Stock'
    if (item.maximumStockLevel && item.quantity >= item.maximumStockLevel) return 'Overstock'
    return 'In Stock'
  }

  const getStatusColor = (status) => {
    return STOCK_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-box text-4xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">Item not found</p>
        <Link to="/inventory" className="inline-block mt-4 text-emerald-600 hover:underline">
          Back to Inventory
        </Link>
      </div>
    )
  }

  const status = getStockStatus(item)
  const statusColor = getStatusColor(status)

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{item.itemName}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                {status}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              Code: <span className="font-mono">{item.itemCode}</span> • 
              Category: {item.category}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowStockForm(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm"
            >
              <i className="fas fa-exchange-alt mr-2"></i>
              Update Stock
            </button>
            <button
              onClick={() => navigate('/inventory')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Item Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Item Name</label>
                <p className="font-medium text-gray-800">{item.itemName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Category</label>
                <p className="font-medium text-gray-800">{item.category}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Code</label>
                <p className="font-mono text-sm text-gray-800">{item.itemCode}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Unit</label>
                <p className="font-medium text-gray-800">{item.unitOfMeasurement}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Current Quantity</label>
                <p className="font-medium text-gray-800">{item.quantity} {item.unitOfMeasurement}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Minimum Stock Level</label>
                <p className="font-medium text-gray-800">{item.minimumStockLevel} {item.unitOfMeasurement}</p>
              </div>
              {item.maximumStockLevel && (
                <div>
                  <label className="text-sm text-gray-500">Maximum Stock Level</label>
                  <p className="font-medium text-gray-800">{item.maximumStockLevel} {item.unitOfMeasurement}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-500">Unit Price</label>
                <p className="font-medium text-gray-800">RWF {item.unitPrice?.toLocaleString() || 0}</p>
              </div>
              {item.supplier && (
                <div>
                  <label className="text-sm text-gray-500">Supplier</label>
                  <p className="font-medium text-gray-800">{item.supplier}</p>
                </div>
              )}
              {item.location && (
                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <p className="font-medium text-gray-800">{item.location}</p>
                </div>
              )}
              {item.description && (
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500">Description</label>
                  <p className="font-medium text-gray-800">{item.description}</p>
                </div>
              )}
              {item.notes && (
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500">Notes</label>
                  <p className="font-medium text-gray-800">{item.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stock Movements */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
            <h3 className="font-semibold text-gray-800 mb-4">Stock Movements</h3>
            {movements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Quantity</th>
                      <th className="pb-2">Previous</th>
                      <th className="pb-2">New</th>
                      <th className="pb-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((movement, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2 text-gray-600">
                          {new Date(movement.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            movement.movementType === 'Stock In' ? 'bg-green-100 text-green-700' :
                            movement.movementType === 'Stock Out' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {movement.movementType}
                          </span>
                        </td>
                        <td className="py-2 font-medium">{movement.quantity}</td>
                        <td className="py-2 text-gray-600">{movement.previousQuantity}</td>
                        <td className="py-2 font-medium">{movement.newQuantity}</td>
                        <td className="py-2 text-gray-600">{movement.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No stock movements recorded yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowStockForm(true)}
                className="w-full text-left px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition font-medium text-sm"
              >
                <i className="fas fa-plus-circle mr-2"></i>
                Add Stock
              </button>
              <button
                onClick={() => {
                  setStockData({ quantity: '', movementType: 'Stock Out', notes: '' })
                  setShowStockForm(true)
                }}
                className="w-full text-left px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium text-sm"
              >
                <i className="fas fa-minus-circle mr-2"></i>
                Remove Stock
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">Stock Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Current Stock</span>
                <span className="font-medium">{item.quantity} {item.unitOfMeasurement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Min Stock Level</span>
                <span className="font-medium">{item.minimumStockLevel} {item.unitOfMeasurement}</span>
              </div>
              {item.maximumStockLevel && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Stock Level</span>
                  <span className="font-medium">{item.maximumStockLevel} {item.unitOfMeasurement}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">Timestamps</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium">{new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Update Stock</h3>
              <button
                onClick={() => setShowStockForm(false)}
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

            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Movement Type *
                </label>
                <select
                  value={stockData.movementType}
                  onChange={(e) => setStockData({ ...stockData, movementType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                  required
                >
                  <option value="Stock In">Stock In</option>
                  <option value="Stock Out">Stock Out</option>
                  <option value="Adjustment">Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity ({item.unitOfMeasurement}) *
                </label>
                <input
                  type="number"
                  value={stockData.quantity}
                  onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={stockData.notes}
                  onChange={(e) => setStockData({ ...stockData, notes: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                  placeholder="Reason for stock update..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 gradient-bg text-white font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Update Stock'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStockForm(false)}
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

export default ItemDetails