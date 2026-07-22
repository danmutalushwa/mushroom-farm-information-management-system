import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { salesAPI } from '../../api/sales'
import StatusBadge from '../../components/Common/StatusBadge'
import { PAYMENT_STATUS_OPTIONS } from '../../constants'

const SaleDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sale, setSale] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'Cash',
    referenceNumber: '',
    notes: ''
  })
  const [invoiceData, setInvoiceData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSaleDetails()
  }, [id])

  const fetchSaleDetails = async () => {
    try {
      setLoading(true)
      const [saleRes, paymentsRes] = await Promise.all([
        salesAPI.getById(id),
        salesAPI.getPayments(id)
      ])
      setSale(saleRes.data.data)
      setPayments(paymentsRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch sale:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (parseFloat(paymentData.amount) <= 0) {
      setError('Please enter a valid payment amount')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await salesAPI.recordPayment(id, {
        ...paymentData,
        amount: parseFloat(paymentData.amount)
      })
      setShowPaymentForm(false)
      setPaymentData({ amount: '', paymentMethod: 'Cash', referenceNumber: '', notes: '' })
      fetchSaleDetails()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGenerateInvoice = async () => {
    try {
      const response = await salesAPI.generateInvoice(id)
      setInvoiceData(response.data.data)
      setShowInvoice(true)
    } catch (error) {
      alert('Failed to generate invoice')
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

  if (!sale) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-coins text-4xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">Sale not found</p>
        <Link to="/sales" className="inline-block mt-4 text-emerald-600 hover:underline">
          Back to Sales
        </Link>
      </div>
    )
  }

  const balanceDue = sale.totalAmount - (sale.amountPaid || 0)

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{sale.saleNumber}</h1>
              <StatusBadge status={sale.paymentStatus} />
            </div>
            <p className="text-gray-600 mt-1">
              Customer: {sale.customerName} • Order: <Link to={`/orders/${sale.orderId}`} className="text-blue-600 hover:underline">{sale.orderNumber}</Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {balanceDue > 0 && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
              >
                <i className="fas fa-credit-card mr-2"></i>
                Record Payment
              </button>
            )}
            <button
              onClick={handleGenerateInvoice}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              <i className="fas fa-file-invoice mr-2"></i>
              Generate Invoice
            </button>
            <button
              onClick={() => navigate('/sales')}
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
        {/* Sale Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Sale Items</h3>
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
                  {sale.items.map((item, index) => (
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
                    <td className="py-2 text-right">{formatCurrency(sale.subtotal)}</td>
                  </tr>
                  {sale.tax > 0 && (
                    <tr>
                      <td colSpan="4" className="py-2 text-right text-gray-600">Tax</td>
                      <td className="py-2 text-right">{formatCurrency(sale.tax)}</td>
                    </tr>
                  )}
                  {sale.discount > 0 && (
                    <tr>
                      <td colSpan="4" className="py-2 text-right text-gray-600">Discount</td>
                      <td className="py-2 text-right text-red-600">-{formatCurrency(sale.discount)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan="4" className="py-2 text-right font-bold text-lg">Total</td>
                    <td className="py-2 text-right font-bold text-emerald-600 text-lg">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payments History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
            <h3 className="font-semibold text-gray-800 mb-4">Payment History</h3>
            {payments.length === 0 ? (
              <p className="text-gray-500 text-sm">No payments recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Method</th>
                      <th className="pb-2">Reference</th>
                      <th className="pb-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td className="py-2 font-medium text-green-600">{formatCurrency(payment.amount)}</td>
                        <td className="py-2">{payment.paymentMethod}</td>
                        <td className="py-2 text-gray-500">{payment.referenceNumber || '-'}</td>
                        <td className="py-2 text-gray-500">{payment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sale Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-bold">{formatCurrency(sale.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-bold text-green-600">{formatCurrency(sale.amountPaid || 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Balance Due</span>
                <span className={`font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(balanceDue)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={sale.paymentStatus} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Sale Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Sale Number</span>
                <span className="font-mono text-sm">{sale.saleNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Order</span>
                <Link to={`/orders/${sale.orderId}`} className="text-blue-600 hover:underline font-mono text-sm">
                  {sale.orderNumber}
                </Link>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Customer</span>
                <Link to={`/customers/${sale.customerId}`} className="text-emerald-600 hover:underline font-medium">
                  {sale.customerName}
                </Link>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Sale Date</span>
                <span>{new Date(sale.saleDate || sale.createdAt).toLocaleDateString()}</span>
              </div>
              {sale.notes && (
                <div className="py-2">
                  <p className="text-gray-500 mb-1">Notes</p>
                  <p className="font-medium">{sale.notes}</p>
                </div>
              )}
            </div>
          </div>

          {balanceDue <= 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-2 text-green-700">
                <i className="fas fa-check-circle text-xl"></i>
                <h3 className="font-semibold">Fully Paid</h3>
              </div>
              <p className="text-sm text-green-600 mt-1">This sale has been fully paid.</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Record Payment</h3>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Balance Due</span>
                <span className="font-bold text-red-600">{formatCurrency(balanceDue)}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  step="0.01"
                  min="0.01"
                  max={balanceDue}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="e.g., Transaction ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                  placeholder="Payment notes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 gradient-bg text-white font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Record Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Invoice</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm"
                >
                  <i className="fas fa-print mr-2"></i>
                  Print
                </button>
                <button
                  onClick={() => setShowInvoice(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                >
                  <i className="fas fa-times mr-2"></i>
                  Close
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div className="border-2 border-gray-200 rounded-xl p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-emerald-600">INVOICE</h1>
                  <p className="text-gray-500">#{invoiceData.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">Mushroom Farm</div>
                  <div className="text-sm text-gray-500">Kigali, Rwanda</div>
                  <div className="text-sm text-gray-500">info@mushroomfarm.com</div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Bill To</p>
                  <p className="font-medium">{invoiceData.customerName}</p>
                  <p className="text-sm text-gray-600">{invoiceData.customerPhone}</p>
                  {invoiceData.customerEmail && (
                    <p className="text-sm text-gray-600">{invoiceData.customerEmail}</p>
                  )}
                  {invoiceData.customerAddress && (
                    <p className="text-sm text-gray-600">{invoiceData.customerAddress}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-500">Invoice Date:</span>
                    <span>{new Date(invoiceData.invoiceDate).toLocaleDateString()}</span>
                    <span className="text-gray-500">Due Date:</span>
                    <span>{new Date(invoiceData.dueDate).toLocaleDateString()}</span>
                    <span className="text-gray-500">Order #:</span>
                    <span>{invoiceData.orderNumber}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <table className="w-full mb-8">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                    <th className="px-4 py-2 text-right text-sm font-medium">Qty</th>
                    <th className="px-4 py-2 text-right text-sm font-medium">Unit Price</th>
                    <th className="px-4 py-2 text-right text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-3">{item.productName}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{item.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium">{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="px-4 py-2 text-right font-medium">Subtotal</td>
                    <td className="px-4 py-2 text-right">{invoiceData.subtotal.toLocaleString()}</td>
                  </tr>
                  {invoiceData.tax > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-right text-gray-600">Tax</td>
                      <td className="px-4 py-2 text-right">{invoiceData.tax.toLocaleString()}</td>
                    </tr>
                  )}
                  {invoiceData.discount > 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-right text-gray-600">Discount</td>
                      <td className="px-4 py-2 text-right text-red-600">-{invoiceData.discount.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan="3" className="px-4 py-2 text-right font-bold text-lg">Total</td>
                    <td className="px-4 py-2 text-right font-bold text-emerald-600 text-lg">
                      {invoiceData.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Payment Status */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className="text-sm text-gray-500">Payment Status:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    invoiceData.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {invoiceData.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Amount Paid: {invoiceData.amountPaid?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-500">Balance Due: {invoiceData.balanceDue?.toLocaleString() || 0}</div>
                </div>
              </div>

              {invoiceData.notes && (
                <div className="mt-4 text-sm text-gray-500">
                  <span className="font-medium">Notes:</span> {invoiceData.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SaleDetails