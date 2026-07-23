import api from './axios'

export const customerAPI = {
  // Get all customers with pagination and filters
  getAll: (params = {}) => {
    const { page = 1, limit = 10, customerType, isActive, search } = params
    let query = `?page=${page}&limit=${limit}`
    if (customerType) query += `&customerType=${encodeURIComponent(customerType)}`
    if (isActive !== undefined && isActive !== '') query += `&isActive=${isActive}`
    if (search) query += `&search=${encodeURIComponent(search)}`
    return api.get(`/customers${query}`)
  },

  // Get single customer by ID
  getById: (id) => api.get(`/customers/${id}`),

  // Get customer by phone
  getByPhone: (phone) => api.get(`/customers/phone/${phone}`),

  // Get customer by code
  getByCode: (code) => api.get(`/customers/code/${code}`),

  // FIXED: Create new customer - Uses auth endpoint
  create: (data) => {
    // For admin-created customers, send to auth endpoint
    // This will create both Customer and User accounts
    return api.post('/auth/register-customer', data)
  },

  // NEW: Public registration (for signup page)
  publicRegister: (data) => {
    return api.post('/auth/public-register-customer', data)
  },

  // Update customer
  update: (id, data) => api.put(`/customers/${id}`, data),

  // Get purchase history
  getPurchaseHistory: (id) => api.get(`/customers/${id}/purchase-history`),

  // Deactivate customer
  deactivate: (id) => api.put(`/customers/${id}/deactivate`),

  // Activate customer
  activate: (id) => api.put(`/customers/${id}/activate`),

  // Delete customer
  delete: (id) => api.delete(`/customers/${id}`)
}