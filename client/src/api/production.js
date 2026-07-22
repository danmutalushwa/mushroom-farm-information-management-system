import api from './axios'

export const productionAPI = {
  // Get all batches with pagination and filters
  getAll: (params = {}) => {
    const { page = 1, limit = 10, status, mushroomType, search } = params
    let query = `?page=${page}&limit=${limit}`
    if (status) query += `&status=${encodeURIComponent(status)}`
    if (mushroomType) query += `&mushroomType=${encodeURIComponent(mushroomType)}`
    if (search) query += `&search=${encodeURIComponent(search)}`
    return api.get(`/production${query}`)
  },

  // Get single batch by ID
  getById: (id) => api.get(`/production/${id}`),

  // Get batch by number
  getByNumber: (batchNumber) => api.get(`/production/number/${batchNumber}`),

  // Create new batch
  create: (data) => api.post('/production', data),

  // Update batch
  update: (id, data) => api.put(`/production/${id}`, data),

  // Add harvest to batch
  addHarvest: (id, data) => api.post(`/production/${id}/harvest`, data),

  // Record loss
  recordLoss: (id, data) => api.post(`/production/${id}/loss`, data),

  // Update batch status
  updateStatus: (id, data) => api.put(`/production/${id}/status`, data),

  // Get batch statistics
  getStatistics: (id) => api.get(`/production/${id}/statistics`),

  // Delete batch
  delete: (id) => api.delete(`/production/${id}`)
}