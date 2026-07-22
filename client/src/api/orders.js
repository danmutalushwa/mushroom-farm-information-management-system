import api from './axios'

export const orderAPI = {
  // Get all orders with pagination and filters
  getAll: (params = {}) => {
    const { page = 1, limit = 10, status, paymentStatus, search } = params
    let query = `?page=${page}&limit=${limit}`
    if (status) query += `&status=${encodeURIComponent(status)}`
    if (paymentStatus) query += `&paymentStatus=${encodeURIComponent(paymentStatus)}`
    if (search) query += `&search=${encodeURIComponent(search)}`
    return api.get(`/orders${query}`)
  },

  // Get order statistics
  getStatistics: () => api.get('/orders/statistics'),

  // Get single order by ID
  getById: (id) => api.get(`/orders/${id}`),

  // Get order by number
  getByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),

  // Get orders by customer
  getByCustomer: (customerId, params = {}) => {
    const { page = 1, limit = 10 } = params
    return api.get(`/orders/customer/${customerId}?page=${page}&limit=${limit}`)
  },

  // Create new order
  create: (data) => api.post('/orders', data),

  // Update order status
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),

  // Update payment status
  updatePayment: (id, data) => api.put(`/orders/${id}/payment`, data),

  // Cancel order
  cancel: (id, data) => api.put(`/orders/${id}/cancel`, data),

  // Delete order
  delete: (id) => api.delete(`/orders/${id}`)
}