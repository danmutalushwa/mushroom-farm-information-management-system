import api from './axios'

export const notificationsAPI = {
  // Get all notifications with pagination
  getAll: (params = {}) => {
    const { page = 1, limit = 10, isRead } = params
    let query = `?page=${page}&limit=${limit}`
    if (isRead !== undefined && isRead !== '') query += `&isRead=${isRead}`
    return api.get(`/notifications${query}`)
  },

  // Get unread count
  getUnreadCount: () => api.get('/notifications/unread-count'),

  // Get single notification by ID
  getById: (id) => api.get(`/notifications/${id}`),

  // Create notification (Admin only)
  create: (data) => api.post('/notifications', data),

  // Mark as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => api.put('/notifications/mark-all-read'),

  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}`)
}