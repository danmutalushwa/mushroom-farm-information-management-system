import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsAPI } from '../../api/notifications'
import { useAuth } from '../../context/AuthContext'

const CreateNotification = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    type: 'System Alert',
    title: '',
    message: '',
    recipientRole: [],
    priority: 'medium',
    category: 'info',
    link: ''
  })

  // Available roles for targeting
  const roles = [
    { value: 'Administrator', label: 'Administrator' },
    { value: 'Production Supervisor', label: 'Production Supervisor' },
    { value: 'Inventory Officer', label: 'Inventory Officer' },
    { value: 'Sales Officer', label: 'Sales Officer' },
    { value: 'Farm Worker', label: 'Farm Worker' },
    { value: 'Customer', label: 'Customer' }
  ]

  const notificationTypes = [
    'System Alert',
    'Production Update',
    'Inventory Alert',
    'Order Status',
    'Payment Notification',
    'Task Reminder',
    'General Announcement'
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      // Handle multi-select for roles
      if (checked) {
        setFormData({
          ...formData,
          recipientRole: [...formData.recipientRole, value]
        })
      } else {
        setFormData({
          ...formData,
          recipientRole: formData.recipientRole.filter(role => role !== value)
        })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Please enter a notification title')
      return
    }

    if (!formData.message.trim()) {
      setError('Please enter a notification message')
      return
    }

    if (formData.recipientRole.length === 0) {
      setError('Please select at least one recipient role')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await notificationsAPI.create(formData)
      setSuccess('Notification sent successfully!')
      setTimeout(() => navigate('/notifications'), 2000)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Send Notification</h1>
            <p className="text-gray-600 mt-1">Broadcast alerts to specific user roles</p>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notification Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
              required
            >
              {notificationTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Notification title"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              placeholder="Write your notification message..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Roles *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <label key={role.value} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    value={role.value}
                    checked={formData.recipientRole.includes(role.value)}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded"
                  />
                  <span className="text-sm text-gray-700">{role.label}</span>
                </label>
              ))}
            </div>
            {formData.recipientRole.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Select at least one role</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
              >
                <option value="info">Info</option>
                <option value="alert">Alert</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link (Optional)
            </label>
            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="/dashboard or https://example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Add a link for users to click for more information</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 gradient-bg text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Send Notification'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateNotification