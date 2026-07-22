import api from './axios'

export const settingsAPI = {
  // Get farm profile
  getFarmProfile: () => api.get('/settings/farm-profile'),

  // Update farm profile
  updateFarmProfile: (data) => api.put('/settings/farm-profile', data),

  // Get all settings
  getAll: (params = {}) => {
    const { category } = params
    let query = ''
    if (category) query += `?category=${encodeURIComponent(category)}`
    return api.get(`/settings${query}`)
  },

  // Get single setting
  getSetting: (category, key) => api.get(`/settings/${category}/${key}`),

  // Update setting
  updateSetting: (category, key, data) => api.put(`/settings/${category}/${key}`, data),

  // Create setting
  createSetting: (data) => api.post('/settings', data),

  // Delete setting
  deleteSetting: (category, key) => api.delete(`/settings/${category}/${key}`),

  // Get audit logs
  getAuditLogs: (params = {}) => {
    const { page = 1, limit = 10, module, status } = params
    let query = `?page=${page}&limit=${limit}`
    if (module) query += `&module=${encodeURIComponent(module)}`
    if (status) query += `&status=${encodeURIComponent(status)}`
    return api.get(`/audit${query}`)
  },

  // Get audit statistics
  getAuditStatistics: (params = {}) => {
    const { startDate, endDate } = params
    let query = '?'
    if (startDate) query += `startDate=${startDate}&`
    if (endDate) query += `endDate=${endDate}`
    return api.get(`/audit/statistics${query}`)
  },

  // Get audit log by ID
  getAuditLogById: (id) => api.get(`/audit/${id}`),

  // Get logs by user
  getAuditLogsByUser: (userId) => api.get(`/audit/user/${userId}`),

  // Get logs by module
  getAuditLogsByModule: (module) => api.get(`/audit/module/${module}`),

  // Clean old logs
  cleanOldLogs: (data) => api.post('/audit/clean', data)
}