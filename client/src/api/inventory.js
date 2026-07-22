import api from './axios'

export const inventoryAPI = {
  // Get all items with pagination and filters
  getAll: (params = {}) => {
    const { page = 1, limit = 10, category, stockStatus, search } = params
    let query = `?page=${page}&limit=${limit}`
    if (category) query += `&category=${encodeURIComponent(category)}`
    if (stockStatus) query += `&stockStatus=${encodeURIComponent(stockStatus)}`
    if (search) query += `&search=${encodeURIComponent(search)}`
    return api.get(`/inventory${query}`)
  },

  // Get low stock items
  getLowStock: () => api.get('/inventory/low-stock'),

  // Get single item by ID
  getById: (id) => api.get(`/inventory/${id}`),

  // Get item by code
  getByCode: (code) => api.get(`/inventory/code/${code}`),

  // Create new item
  create: (data) => api.post('/inventory', data),

  // Update item
  update: (id, data) => api.put(`/inventory/${id}`, data),

  // Update stock
  updateStock: (id, data) => api.put(`/inventory/${id}/stock`, data),

  // Get stock movements
  getMovements: (id, params = {}) => {
    const { page = 1, limit = 10 } = params
    return api.get(`/inventory/${id}/movements?page=${page}&limit=${limit}`)
  },

  // Delete item
  delete: (id) => api.delete(`/inventory/${id}`)
}