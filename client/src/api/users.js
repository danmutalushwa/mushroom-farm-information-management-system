import api from './axios'

export const usersAPI = {
  // Get all users with pagination and filters
  getAll: (params = {}) => {
    const { page = 1, limit = 10, role, isActive, search } = params
    let query = `?page=${page}&limit=${limit}`
    if (role) query += `&role=${encodeURIComponent(role)}`
    if (isActive !== undefined && isActive !== '') query += `&isActive=${isActive}`
    if (search) query += `&search=${encodeURIComponent(search)}`
    return api.get(`/users${query}`)
  },

  // Get single user by ID
  getById: (id) => api.get(`/users/${id}`),

  // Create user (Admin only)
  create: (data) => api.post('/auth/register', data),

  // Update user (Admin only)
  update: (id, data) => api.put(`/users/${id}`, data),

  // Update user role (Admin only)
  updateRole: (id, data) => api.put(`/users/${id}/role`, data),

  // Activate user (Admin only)
  activate: (id) => api.put(`/users/${id}/activate`),

  // Deactivate user (Admin only)
  deactivate: (id) => api.put(`/users/${id}/deactivate`),

  // Delete user (Admin only)
  delete: (id) => api.delete(`/users/${id}`)
}