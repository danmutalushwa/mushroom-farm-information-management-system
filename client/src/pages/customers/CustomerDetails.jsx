import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { customerAPI } from '../../api/customers'
import StatusBadge from '../../components/Common/StatusBadge'

const CustomerDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [purchaseHistory, setPurchaseHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCustomerDetails()
  }, [id])

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true)
      const [customerRes, historyRes] = await Promise.all([
        customerAPI.getById(id),
        customerAPI.getPurchaseHistory(id)
      ])
      setCustomer(customerRes.data.data)
      setPurchaseHistory(historyRes.data.data || [])
      setFormData(customerRes.data.data)
    } catch (error) {
      console.error('Failed to fetch customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await customerAPI.update(id, formData)
      setIsEditing(false)
      fetchCustomerDetails()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update customer')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleStatus = async () => {
    try {
      if (customer.isActive) {
        await customerAPI.deactivate(id)
      } else {
        await customerAPI.activate(id)
      }
      fetchCustomerDetails()
    } catch (error) {
      alert('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-user text-4xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">Customer not found</p>
        <Link to="/customers" className="inline-block mt-4 text-emerald-600 hover:underline">
          Back to Customers
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
              <h1 className="text-2xl font-bold text-gray-800">{customer.fullName}</h1>
              <StatusBadge status={customer.isActive ? 'Active' : 'Inactive'} />
            </div>
            <p className="text-gray-600 mt-1">
              Code: <span className="font-mono">{customer.customerCode}</span> • 
              Type: {customer.customerType}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'} mr-2`}></i>
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </button>
            <button
              onClick={toggleStatus}
              className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                customer.isActive 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <i className={`fas ${customer.isActive ? 'fa-pause' : 'fa-play'} mr-2`}></i>
              {customer.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => navigate('/customers')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">
              {isEditing ? 'Edit Customer Information' : 'Customer Information'}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Type *
                  </label>
                  <select
                    name="customerType"
                    value={formData.customerType || 'Individual'}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                    required
                  >
                    <option value="Individual">Individual</option>
                    <option value="Business">Business</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Retailer">Retailer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleEditChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full gradient-bg text-white font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Update Customer'}
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <p className="font-medium text-gray-800">{customer.fullName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Customer Code</label>
                  <p className="font-mono text-sm text-gray-800">{customer.customerCode}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone Number</label>
                  <p className="font-medium text-gray-800">{customer.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium text-gray-800">{customer.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="font-medium text-gray-800">{customer.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Customer Type</label>
                  <p className="font-medium text-gray-800">{customer.customerType}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p className="font-medium text-gray-800">
                    <StatusBadge status={customer.isActive ? 'Active' : 'Inactive'} />
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Last Purchase</label>
                  <p className="font-medium text-gray-800">
                    {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                {customer.notes && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500">Notes</label>
                    <p className="font-medium text-gray-800">{customer.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Purchase History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
            <h3 className="font-semibold text-gray-800 mb-4">Purchase History</h3>
            {purchaseHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No purchase history found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Order #</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Items</th>
                      <th className="pb-2">Total</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseHistory.map((order) => (
                      <tr key={order._id} className="border-b last:border-0">
                        <td className="py-2 font-medium text-emerald-600">
                          {order.orderNumber}
                        </td>
                        <td className="py-2 text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2">{order.totalItems || order.items?.length || 0}</td>
                        <td className="py-2 font-medium">
                          RWF {order.totalAmount?.toLocaleString() || 0}
                        </td>
                        <td className="py-2">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Customer Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Total Orders</span>
                <span className="font-bold text-gray-800">{customer.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Total Purchases</span>
                <span className="font-bold text-gray-800">{customer.totalPurchases || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Total Spent</span>
                <span className="font-bold text-emerald-600">
                  RWF {customer.totalSpent?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Member Since</span>
                <span className="font-medium text-gray-800">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/orders/create"
                state={{ customerId: customer._id }}
                className="block w-full text-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm"
              >
                <i className="fas fa-cart-plus mr-2"></i>
                Create Order
              </Link>
              <button
                onClick={() => {
                  if (window.confirm('Delete this customer?')) {
                    customerAPI.delete(id).then(() => navigate('/customers'))
                  }
                }}
                className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
              >
                <i className="fas fa-trash mr-2"></i>
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDetails