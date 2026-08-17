import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { orderAPI } from '../../api/orders'
import { salesAPI } from '../../api/sales'

const CreateSale = () => {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await orderAPI.getAll({
        page: 1,
        limit: 100
      })

      setOrders(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOrderChange = (e) => {
    const orderId = e.target.value

    const order = orders.find((item) => item._id === orderId)

    setSelectedOrder(order || null)

    if (order) {
      setAmountPaid('')
    }
  }

  const formatCurrency = (amount) => {
    return `RWF ${Number(amount || 0).toLocaleString()}`
  }

  const totalAmount = Number(selectedOrder?.totalAmount || 0)
  const paidAmount = Number(amountPaid || 0)
  const balance = totalAmount - paidAmount

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedOrder) {
      setError('Please select an order.')
      return
    }

    if (!amountPaid || paidAmount < 0) {
      setError('Please enter a valid amount paid.')
      return
    }

    if (paidAmount > totalAmount) {
      setError('Amount paid cannot be greater than the order total.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      await salesAPI.createFromOrder(selectedOrder._id, {
        amountPaid: paidAmount,
        paymentMethod
      })

      navigate('/sales')
    } catch (err) {
      console.error('Failed to create sale:', err)

      setError(
        err.response?.data?.message ||
        'Failed to create sale. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Create Sale
            </h1>
            <p className="text-gray-600 mt-1">
              Process a new sale transaction
            </p>
          </div>

          <Link
            to="/sales"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Sales
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Order Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Select Order
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <i className="fas fa-spinner fa-spin text-2xl text-emerald-600"></i>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>

              <select
                value={selectedOrder?._id || ''}
                onChange={handleOrderChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">
                  -- Select an order --
                </option>

                {orders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {order.orderNumber} - {order.customerName} -{' '}
                    {formatCurrency(order.totalAmount)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Order Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-semibold text-gray-800">
                    {selectedOrder.orderNumber}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-800">
                    {selectedOrder.customerName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-800">
                    {selectedOrder.customerPhone}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(
                      selectedOrder.orderDate || selectedOrder.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Order Items
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Unit Price</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {item.productName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.productCode}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {item.quantity}
                        </td>

                        <td className="px-4 py-3">
                          {formatCurrency(item.unitPrice)}
                        </td>

                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Payment Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Paid
                  </label>

                  <input
                    type="number"
                    min="0"
                    max={totalAmount}
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Enter amount paid"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>

                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Sale Summary
              </h2>

              <div className="space-y-3 max-w-md ml-auto">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Total</span>
                  <span className="font-semibold">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(paidAmount)}
                  </span>
                </div>

                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-800">
                    Balance
                  </span>
                  <span
                    className={`font-bold ${
                      balance > 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link
                to="/sales"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Create Sale
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}

export default CreateSale