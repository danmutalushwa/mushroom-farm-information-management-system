import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const FarmManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    readyForHarvest: 0,
    inventoryItems: 0,
    lowStockItems: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalSales: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [
        batches,
        activeBatches,
        readyForHarvest,
        inventory,
        lowStock,
        orders,
        pendingOrders,
        sales
      ] = await Promise.all([
        api.get('/production?limit=1'),
        api.get('/production?status=In%20Progress&limit=1'),
        api.get('/production?status=Ready%20for%20Harvest&limit=1'),
        api.get('/inventory?limit=1'),
        api.get('/inventory/low-stock'),
        api.get('/orders?limit=1'),
        api.get('/orders?status=Pending&limit=1'),
        api.get('/sales?limit=1')
      ])

      setStats({
        totalBatches: batches.data.pagination?.total || 0,
        activeBatches: activeBatches.data.pagination?.total || 0,
        readyForHarvest: readyForHarvest.data.pagination?.total || 0,
        inventoryItems: inventory.data.pagination?.total || 0,
        lowStockItems: lowStock.data.data?.length || 0,
        totalOrders: orders.data.pagination?.total || 0,
        pendingOrders: pendingOrders.data.pagination?.total || 0,
        totalSales: sales.data.pagination?.total || 0
      })
    } catch (error) {
      console.error('Failed to fetch farm manager dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Batches',
      value: stats.totalBatches,
      icon: 'fa-seedling',
      color: 'bg-emerald-500',
      link: '/production'
    },
    {
      title: 'Active Batches',
      value: stats.activeBatches,
      icon: 'fa-spinner',
      color: 'bg-yellow-500',
      link: '/production'
    },
    {
      title: 'Ready for Harvest',
      value: stats.readyForHarvest,
      icon: 'fa-basket-shopping',
      color: 'bg-green-500',
      link: '/production'
    },
    {
      title: 'Inventory Items',
      value: stats.inventoryItems,
      icon: 'fa-warehouse',
      color: 'bg-blue-500',
      link: '/inventory'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: 'fa-triangle-exclamation',
      color: 'bg-red-500',
      link: '/inventory/low-stock'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: 'fa-cart-shopping',
      color: 'bg-orange-500',
      link: '/orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: 'fa-clock',
      color: 'bg-purple-500',
      link: '/orders?status=Pending'
    },
    {
      title: 'Total Sales',
      value: stats.totalSales,
      icon: 'fa-coins',
      color: 'bg-indigo-500',
      link: '/sales'
    }
  ]

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
        <h1 className="text-2xl font-bold text-gray-800">
          Farm Manager Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Overview of farm production, inventory, orders and sales
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 card-hover block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {card.value}
                </p>
              </div>

              <div
                className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white text-xl`}
              >
                <i className={`fas ${card.icon}`}></i>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/production"
            className="p-4 bg-emerald-50 rounded-xl text-center hover:bg-emerald-100 transition"
          >
            <i className="fas fa-seedling text-emerald-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">
              Production
            </p>
          </Link>

          <Link
            to="/inventory"
            className="p-4 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition"
          >
            <i className="fas fa-warehouse text-blue-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">
              Inventory
            </p>
          </Link>

          <Link
            to="/orders"
            className="p-4 bg-orange-50 rounded-xl text-center hover:bg-orange-100 transition"
          >
            <i className="fas fa-cart-shopping text-orange-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">
              Orders
            </p>
          </Link>

          <Link
            to="/reports"
            className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition"
          >
            <i className="fas fa-file-lines text-purple-600 text-2xl"></i>
            <p className="text-sm font-medium text-gray-700 mt-2">
              Reports
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FarmManagerDashboard