import api from './axios'

export const salesAPI = {
  // Get all sales with pagination and filters
  getAll: (params = {}) => {
    const { page = 1, limit = 10, paymentStatus, search } = params
    let query = `?page=${page}&limit=${limit}`
    if (paymentStatus) query += `&paymentStatus=${encodeURIComponent(paymentStatus)}`
    if (search) query += `&search=${encodeURIComponent(search)}`
    return api.get(`/sales${query}`)
  },

  // Get sales statistics
  getStatistics: () => api.get('/sales/statistics'),

  // Get single sale by ID
  getById: (id) => api.get(`/sales/${id}`),

  // Get sale by number
  getByNumber: (saleNumber) => api.get(`/sales/number/${saleNumber}`),

  // Create sale from order
  createFromOrder: (orderId, data) => api.post(`/sales/order/${orderId}`, data),

  // Record payment
  recordPayment: (saleId, data) => api.post(`/sales/${saleId}/payment`, data),

  // Generate invoice
  generateInvoice: (saleId) => api.post(`/sales/${saleId}/invoice`),

  // Get payments for sale
  getPayments: (saleId) => api.get(`/sales/${saleId}/payments`),

  // Get invoice
  getInvoice: (saleId) => api.get(`/sales/${saleId}/invoice`)
}