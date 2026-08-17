import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orderAPI } from '../../api/orders'
import StatusBadge from '../../components/Common/StatusBadge'
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '../../constants'

const OrderDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [showPaymentUpdate, setShowPaymentUpdate] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getById(id)
      console.log('ORDER DETAILS RESPONSE:', response.data)
      setOrder(response.data.data)
      setSelectedStatus(response.data.data.status)
      setSelectedPayment(response.data.data.paymentStatus)
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return
    setSubmitting(true)
    setError('')

    try {
      await orderAPI.updateStatus(id, { status: selectedStatus })
      setShowStatusUpdate(false)
      fetchOrderDetails()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update status')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentUpdate = async () => {
    if (!selectedPayment) return
    setSubmitting(true)
    setError('')

    try {
      await orderAPI.updatePayment(id, { paymentStatus: selectedPayment })
      setShowPaymentUpdate(false)
      fetchOrderDetails()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update payment status')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelOrder = async () => {
    const reason = prompt('Please enter cancellation reason:')
    if (!reason) return

    try {
      await orderAPI.cancel(id, { reason })
      fetchOrderDetails()
    } catch (error) {
      alert('Failed to cancel order')
    }
  }

  const formatCurrency = (amount) => {
    return `RWF ${amount?.toLocaleString() || 0}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">Order not found</p>
        <Link to="/orders" className="inline-block mt-4 text-emerald-600 hover:underline">
          Back to Orders
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
              <h1 className="text-2xl font-bold text-gray-800">{order.orderNumber}</h1>
              <StatusBadge status={order.status} />
              <StatusBadge status={order.paymentStatus} />
            </div>
            <p className="text-gray-600 mt-1">
              Customer: {order.customerName} • {order.customerPhone}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {order.status !== 'Completed' && order.status !== 'Cancelled' && (
              <>
                <button
                  onClick={() => setShowStatusUpdate(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                >
                  <i className="fas fa-sync mr-2"></i>
                  Update Status
                </button>
                <button
                  onClick={() => setShowPaymentUpdate(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
                >
                  <i className="fas fa-credit-card mr-2"></i>
                  Update Payment
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel Order
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/orders')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Code</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-2 font-medium">{item.productName}</td>
                      <td className="py-2 text-gray-500 font-mono text-xs">{item.productCode}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2 text-right font-medium">{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan="4" className="py-2 text-right font-medium">Subtotal</td>
                    <td className="py-2 text-right">{formatCurrency(order.subtotal)}</td>
                  </tr>
                  {order.tax > 0 && (
                    <tr>
                      <td colSpan="4" className="py-2 text-right text-gray-600">Tax</td>
                      <td className="py-2 text-right">{formatCurrency(order.tax)}</td>
                    </tr>
                  )}
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan="4" className="py-2 text-right text-gray-600">Discount</td>
                      <td className="py-2 text-right text-red-600">-{formatCurrency(order.discount)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan="4" className="py-2 text-right font-bold text-lg">Total</td>
                    <td className="py-2 text-right font-bold text-emerald-600 text-lg">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Order Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Order Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Order Number</span>
                <span className="font-mono text-sm">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Customer</span>
                <Link to={`/customers/${order.customerId}`} className="text-emerald-600 hover:underline font-medium">
                  {order.customerName}
                </Link>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Phone</span>
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Order Date</span>
                <span>{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</span>
              </div>
              {order.expectedDeliveryDate && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Expected Delivery</span>
                  <span>{new Date(order.expectedDeliveryDate).toLocaleDateString()}</span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="py-2 border-b border-gray-100">
                  <p className="text-gray-500 mb-1">Delivery Address</p>
                  <p className="font-medium">{order.deliveryAddress}</p>
                </div>
              )}
              {order.notes && (
                <div className="py-2">
                  <p className="text-gray-500 mb-1">Notes</p>
                  <p className="font-medium">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {order.cancelledAt && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="font-semibold text-red-700 mb-2">Order Cancelled</h3>
              <div className="space-y-1 text-sm text-red-600">
                <p><span className="font-medium">Reason:</span> {order.cancellationReason || 'Not specified'}</p>
                <p><span className="font-medium">Date:</span> {new Date(order.cancelledAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Update Order Status</h3>
              <button
                onClick={() => setShowStatusUpdate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status: <span className="font-normal text-gray-500">{order.status}</span>
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                >
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={submitting || selectedStatus === order.status}
                className="w-full gradient-bg text-white font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Update Modal */}
      {showPaymentUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Update Payment Status</h3>
              <button
                onClick={() => setShowPaymentUpdate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status: <span className="font-normal text-gray-500">{order.paymentStatus}</span>
                </label>
                <select
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                >
                  {PAYMENT_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handlePaymentUpdate}
                disabled={submitting || selectedPayment === order.paymentStatus}
                className="w-full gradient-bg text-white font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Update Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetails