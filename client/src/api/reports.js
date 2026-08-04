import api from './axios'

export const reportsAPI = {
  // Get all reports with pagination
  getAll: (params = {}) => {
    const { page = 1, limit = 10, reportType, search } = params
    let query = `?page=${page}&limit=${limit}`
    if (reportType) query += `&reportType=${encodeURIComponent(reportType)}`
    if (search) query += `&search=${encodeURIComponent(search)}`
    return api.get(`/reports${query}`)
  },

  // Get single report by ID
  getById: (id) => api.get(`/reports/${id}`),

  // Generate production report
  generateProduction: (params) => {
    const { startDate, endDate, mushroomType } = params
    let query = `?startDate=${startDate}&endDate=${endDate}`
    if (mushroomType) query += `&mushroomType=${encodeURIComponent(mushroomType)}`
    return api.get(`/reports/production${query}`)
  },

  // Generate inventory report
  generateInventory: (params) => {
    const { category, search } = params
    let query = `?category=${encodeURIComponent(category)}`
    if (search) query += `&search=${encodeURIComponent(search)}`
    return api.get(`/reports/inventory${query}`)
  },

  // Generate customer report
  generateCustomer: (params) => {
    const { customerType, isActive, search } = params
    let query = `?`
    if (customerType) query += `customerType=${encodeURIComponent(customerType)}&`
    if (isActive !== undefined && isActive !== '') query += `isActive=${isActive}&`
    if (search) query += `search=${encodeURIComponent(search)}`
    return api.get(`/reports/customers${query}`)
  },

  // Generate order report
  generateOrder: (params) => {
    const { startDate, endDate, status } = params
    let query = `?startDate=${startDate}&endDate=${endDate}`
    if (status) query += `&status=${encodeURIComponent(status)}`
    return api.get(`/reports/orders${query}`)
  },

  // Generate sales report
  generateSales: (params) => {
    const { startDate, endDate, paymentStatus } = params
    let query = `?startDate=${startDate}&endDate=${endDate}`
    if (paymentStatus) query += `&paymentStatus=${encodeURIComponent(paymentStatus)}`
    return api.get(`/reports/sales${query}`)
  },

  // Generate stock movement report
  generateStockMovement: (params) => {
    const { startDate, endDate, movementType } = params
    let query = `?startDate=${startDate}&endDate=${endDate}`
    if (movementType) query += `&movementType=${encodeURIComponent(movementType)}`
    return api.get(`/reports/stock-movements${query}`)
  },

  // Generate financial summary
  generateFinancial: (params) => {
    const { startDate, endDate } = params
    return api.get(`/reports/financial-summary?startDate=${startDate}&endDate=${endDate}`)
  },

  download(id) {
    return api.get(
      `/reports/${id}/download`,
      {
        responseType: 'blob'
      }
    );
  },

  // Delete report
  delete: (id) => api.delete(`/reports/${id}`)

}