import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const InventoryDashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentMovements, setRecentMovements] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [allItems, lowStock] = await Promise.all([
        api.get('/inventory?limit=1'),
        api.get('/inventory/low-stock')
      ])

      // Get recent stock movements
      const movements = await api.get('/inventory?limit=5')

      setStats({
        totalItems: allItems.data.pagination?.total || 0,
        inStock: allItems.data.pagination?.total || 0 - (lowStock.data.data?.length || 0),
        lowStock: lowStock.data.data?.length || 0,
        outOfStock: 0
      })
      setRecentMovements(movements.data.data || [])
    } catch (error) {
      console.error('Failed to fetch inventory data:', error)
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
        <h1 className="text-2xl font-bold text-gray-800">Inventory Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your stock levels and materials</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalItems}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">In Stock</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.inStock}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Inventory Items</h3>
          <Link to="/inventory" className="text-sm text-emerald-600 hover:underline">
            View All
          </Link>
        </div>
        {recentMovements.length === 0 ? (
          <p className="text-gray-500 text-sm">No items found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Item Name</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Quantity</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map((item) => (
                  <tr key={item._id} className="border-b last:border-0">
                    <td className="py-2 font-medium">
                      <Link to={`/inventory/${item._id}`} className="text-emerald-600 hover:underline">
                        {item.itemName}
                      </Link>
                    </td>
                    <td className="py-2">{item.category}</td>
                    <td className="py-2">{item.quantity} {item.unitOfMeasurement}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.quantity <= 0 ? 'bg-red-100 text-red-700' :
                        item.quantity <= item.minimumStockLevel ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.quantity <= 0 ? 'Out of Stock' :
                         item.quantity <= item.minimumStockLevel ? 'Low Stock' :
                         'In Stock'}
                      </span>
                    </td>
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

export default InventoryDashboard