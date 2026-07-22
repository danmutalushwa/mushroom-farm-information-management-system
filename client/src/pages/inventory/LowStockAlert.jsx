import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { inventoryAPI } from '../../api/inventory'

const LowStockAlert = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLowStockItems()
  }, [])

  const fetchLowStockItems = async () => {
    try {
      setLoading(true)
      const response = await inventoryAPI.getLowStock()
      setItems(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch low stock items:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Low Stock Alert</h1>
            <p className="text-gray-600 mt-1">Items that need restocking</p>
          </div>
          <Link
            to="/inventory"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Inventory
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <i className="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">All Stock Levels Are Healthy!</h3>
          <p className="text-gray-500">No items are currently below their minimum stock level.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <p className="text-yellow-700 font-medium">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {items.length} item{items.length > 1 ? 's' : ''} need restocking
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">Item Code</th>
                  <th className="px-6 py-3 font-medium">Item Name</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Current Stock</th>
                  <th className="px-6 py-3 font-medium">Min Level</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
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
                    <td className="px-6 py-3">
                      <span className="font-bold text-red-600">
                        {item.quantity} {item.unitOfMeasurement}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {item.minimumStockLevel} {item.unitOfMeasurement}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        {item.quantity <= 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/inventory/${item._id}`}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                      >
                        Update Stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default LowStockAlert