import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { orderAPI } from '../../api/orders'
import { customerAPI } from '../../api/customers'
import { inventoryAPI } from '../../api/inventory'

const CreateOrder = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [searchCustomer, setSearchCustomer] = useState('')
  const [customerSearchResults, setCustomerSearchResults] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [formData, setFormData] = useState({
    customerId: location.state?.customerId || '',
    tax: 0,
    discount: 0,
    expectedDeliveryDate: '',
    deliveryAddress: '',
    notes: ''
  })
  const [productSearch, setProductSearch] = useState('')
  const [productSearchResults, setProductSearchResults] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [itemQuantity, setItemQuantity] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (formData.customerId) {
      fetchCustomerDetails(formData.customerId)
    }
  }, [formData.customerId])

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll({ limit: 100 })
      setCustomers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await inventoryAPI.getAll({ limit: 100 })
      setProducts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const fetchCustomerDetails = async (id) => {
    try {
      const response = await customerAPI.getById(id)
      setSelectedCustomer(response.data.data)
    } catch (error) {
      console.error('Failed to fetch customer:', error)
    }
  }

  const handleCustomerSearch = (e) => {
    const value = e.target.value
    setSearchCustomer(value)
    if (value.length > 1) {
      const results = customers.filter(c => 
        c.fullName.toLowerCase().includes(value.toLowerCase()) ||
        c.phoneNumber.includes(value) ||
        c.customerCode.toLowerCase().includes(value.toLowerCase())
      )
      setCustomerSearchResults(results.slice(0, 10))
    } else {
      setCustomerSearchResults([])
    }
  }

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer)
    setFormData({ ...formData, customerId: customer._id || customer.id })
    setSearchCustomer('')
    setCustomerSearchResults([])
  }

  const handleProductSearch = (e) => {
    const value = e.target.value
    setProductSearch(value)
    if (value.length > 1) {
      const results = products.filter(p => 
        p.itemName.toLowerCase().includes(value.toLowerCase()) ||
        p.itemCode.toLowerCase().includes(value.toLowerCase())
      )
      setProductSearchResults(results.slice(0, 10))
    } else {
      setProductSearchResults([])
    }
  }

  const addItem = (product) => {
    setSelectedProduct(product)
    setShowProductSearch(true)
  }

  const confirmAddItem = () => {
    if (!selectedProduct || !itemQuantity || parseFloat(itemQuantity) <= 0) {
      setError('Please select a product and enter a valid quantity')
      return
    }

    const existingItem = orderItems.find(item => item.productId === selectedProduct._id)
    if (existingItem) {
      setError('This product is already in the order. Update the quantity instead.')
      return
    }

    const item = {
      productId: selectedProduct._id,
      productName: selectedProduct.itemName,
      productCode: selectedProduct.itemCode,
      quantity: parseFloat(itemQuantity),
      unitPrice: selectedProduct.unitPrice || 0,
      totalPrice: parseFloat(itemQuantity) * (selectedProduct.unitPrice || 0),
      notes: ''
    }

    setOrderItems([...orderItems, item])
    setSelectedProduct(null)
    setItemQuantity('')
    setShowProductSearch(false)
    setProductSearch('')
    setProductSearchResults([])
    setError('')
    updateTotals()
  }

  const removeItem = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index)
    setOrderItems(newItems)
    updateTotals()
  }

  const updateItemQuantity = (index, newQuantity) => {
    const newItems = [...orderItems]
    newItems[index].quantity = parseFloat(newQuantity)
    newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
    setOrderItems(newItems)
    updateTotals()
  }

  const updateTotals = () => {
    // Will be calculated in submit
  }

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const tax = parseFloat(formData.tax) || 0
    const discount = parseFloat(formData.discount) || 0
    const total = subtotal + tax - discount
    return { subtotal, tax, discount, total }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validatedCustomerId = selectedCustomer?._id || selectedCustomer?.id || formData.customerId;
    
    if (!validatedCustomerId) {
      setError('Please select a customer')
      return
    }

    if (orderItems.length === 0) {
      setError('Please add at least one item to the order')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { subtotal, tax, discount, total } = calculateTotals()
      
      const orderData = {
        customerId: validatedCustomerId,
        customerName: selectedCustomer.fullName,
        customerPhone: selectedCustomer.phoneNumber,
        items: orderItems.map(item => ({
          inventoryItem: item.productId,
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice) || 0,
          totalPrice: parseFloat(item.totalPrice) || 0
        })),
        subtotal: parseFloat(subtotal) || 0,
        tax: parseFloat(formData.tax) || 0,
        discount: parseFloat(formData.discount) || 0,
        totalAmount: parseFloat(total) || 0,
        expectedDeliveryDate: formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate).toISOString() : null,
        deliveryAddress: formData.deliveryAddress || selectedCustomer.address,
        notes: formData.notes
      }

      await orderAPI.create(orderData)
      navigate('/orders')
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, tax, discount, total } = calculateTotals()

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create Order</h1>
            <p className="text-gray-600 mt-1">Process a new customer order</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Customer Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer *
            </label>
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div>
                  <p className="font-medium text-gray-800">{selectedCustomer.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer.phoneNumber}</p>
                  <p className="text-xs text-gray-500">Code: {selectedCustomer.customerCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null)
                    setFormData({ ...formData, customerId: '' })
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={searchCustomer}
                  onChange={handleCustomerSearch}
                  placeholder="Search customer by name, phone or code..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
                {customerSearchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                    {customerSearchResults.map((customer) => (
                      <button
                        key={customer._id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition border-b last:border-0"
                      >
                        <p className="font-medium text-gray-800">{customer.fullName}</p>
                        <p className="text-sm text-gray-500">{customer.phoneNumber}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Order Items *
              </label>
              <button
                type="button"
                onClick={() => setShowProductSearch(true)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <i className="fas fa-plus mr-1"></i>
                Add Item
              </button>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <i className="fas fa-box text-3xl text-gray-300 mb-2"></i>
                <p className="text-gray-500 text-sm">No items added yet</p>
                <button
                  type="button"
                  onClick={() => setShowProductSearch(true)}
                  className="mt-2 text-emerald-600 hover:underline text-sm font-medium"
                >
                  Add your first item
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Product</th>
                      <th className="pb-2">Code</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Unit Price</th>
                      <th className="pb-2 text-right">Total</th>
                      <th className="pb-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2 font-medium">{item.productName}</td>
                        <td className="py-2 text-gray-500 font-mono text-xs">{item.productCode}</td>
                        <td className="py-2 text-right">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                            step="0.01"
                            min="0.01"
                          />
                        </td>
                        <td className="py-2 text-right">{item.unitPrice.toLocaleString()}</td>
                        <td className="py-2 text-right font-medium">{item.totalPrice.toLocaleString()}</td>
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address
              </label>
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                placeholder="Delivery address"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{subtotal.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax</span>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  className="w-32 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount</span>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-32 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-emerald-600 text-lg">{total.toLocaleString()} RWF</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
              placeholder="Additional notes..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || orderItems.length === 0}
              className="flex-1 gradient-bg text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Create Order'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Product Search Modal */}
      {showProductSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add Product</h3>
              <button
                onClick={() => {
                  setShowProductSearch(false)
                  setSelectedProduct(null)
                  setItemQuantity('')
                  setProductSearch('')
                  setProductSearchResults([])
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {selectedProduct ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="font-medium text-gray-800">{selectedProduct.itemName}</p>
                  <p className="text-sm text-gray-600">Code: {selectedProduct.itemCode}</p>
                  <p className="text-sm text-gray-600">Available: {selectedProduct.quantity} {selectedProduct.unitOfMeasurement}</p>
                  <p className="text-sm text-gray-600">Price: {selectedProduct.unitPrice?.toLocaleString() || 0} RWF</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    step="0.01"
                    min="0.01"
                    placeholder="Enter quantity"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={confirmAddItem}
                    className="flex-1 gradient-bg text-white font-semibold py-2 rounded-lg hover:opacity-90 transition"
                  >
                    Add to Order
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(null)
                      setItemQuantity('')
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Change Product
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={productSearch}
                  onChange={handleProductSearch}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  autoFocus
                />
                {productSearchResults.length > 0 ? (
                  <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    {productSearchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => addItem(product)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b last:border-0"
                      >
                        <p className="font-medium text-gray-800">{product.itemName}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>Code: {product.itemCode}</span>
                          <span>Stock: {product.quantity} {product.unitOfMeasurement}</span>
                          <span>Price: {product.unitPrice?.toLocaleString() || 0} RWF</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : productSearch.length > 1 ? (
                  <p className="text-gray-500 text-sm mt-4 text-center">No products found</p>
                ) : (
                  <p className="text-gray-400 text-sm mt-4 text-center">Type to search for products</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateOrder