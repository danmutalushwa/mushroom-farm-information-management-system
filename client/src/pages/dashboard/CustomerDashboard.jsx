import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { orderAPI } from '../../api/orders'
import StatusBadge from '../../components/Common/StatusBadge'
const CustomerDashboard = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  })
  useEffect(() => {
    if (user?.customerId) {
      fetchCustomerOrders()
    } else {
      setLoading(false)
    }
  }, [user?.customerId])
  const fetchCustomerOrders = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getByCustomer(user.customerId, {
        page: 1,
        limit: 10
      })
      const customerOrders = response.data.data || []
      const pagination = response.data.pagination || {}
      setOrders(customerOrders)
      const pending = customerOrders.filter(
        order =>
          order.status !== 'Completed' &&
          order.status !== 'Cancelled'
      ).length
      const completed = customerOrders.filter(
        order => order.status === 'Completed'
      ).length
      const totalSpent = customerOrders.reduce(
        (total, order) => total + (order.totalAmount || 0),
        0
      )
      setStats({
        totalOrders: pagination.total || customerOrders.length,
        pendingOrders: pending,
        completedOrders: completed,
        totalSpent
      })
    } catch (error) {
      console.error('Failed to fetch customer orders:', error)
    } finally {
      setLoading(false)
    }
  }
  const formatCurrency = (amount) => {
    return `RWF ${(amount || 0).toLocaleString()}`
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
      </div>
    )
  }
  if (!user?.customerId) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <i className="fas fa-user-circle text-4xl text-gray-300 mb-4"></i>
        <h2 className="text-lg font-semibold text-gray-800">
          Customer Account Not Linked
        </h2>
        <p className="text-gray-500 mt-2">
          Your account is not linked to a customer profile.
        </p>
      </div>
    )
  }
  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user.fullName}
        </h1>
        <p className="text-gray-600 mt-1">
          View and track your orders
        </p>
      </div>
      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">My Orders</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {stats.totalOrders}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pending Orders</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {stats.pendingOrders}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Completed Orders</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.completedOrders}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(stats.totalSpent)}
          </p>
        </div>
      </div>
      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            Recent Orders
          </h2>
          <Link
            to="/orders"
            className="text-sm text-emerald-600 hover:underline font-medium"
          >
            View All
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">
              You have no orders yet.
            </p>
            <Link
              to="/orders/create"
              className="inline-block mt-4 text-emerald-600 hover:underline font-medium"
            >
              Create an Order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">Order #</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Payment</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-3">
                      <Link
                        to={`/orders/${order._id}`}
                        className="font-medium text-emerald-600 hover:underline font-mono text-sm"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-800">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(
                        order.orderDate || order.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
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
export default CustomerDashboard