import api from './axios'

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  registerStaff: (data) => api.post('/auth/register', data),
  registerCustomer: (data) => api.post('/auth/register-customer', data),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data)
}