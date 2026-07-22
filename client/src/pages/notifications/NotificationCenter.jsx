import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { notificationsAPI } from '../../api/notifications'
import { useAuth } from '../../context/AuthContext'

const NotificationCenter = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    isRead: ''
  })
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [filters, pagination.page])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        isRead: filters.isRead
      })
      
      setNotifications(response.data.data || [])
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount()
      setUnreadCount(response.data.data?.count || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const handleFilterChange = (e) => {
    const { value } = e.target
    setFilters({ isRead: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id)
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notification?')) {
      try {
        await notificationsAPI.delete(id)
        fetchNotifications()
        fetchUnreadCount()
      } catch (error) {
        console.error('Failed to delete notification:', error)
      }
    }
  }

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification)
    setShowDetails(true)
    if (!notification.isRead) {
      handleMarkAsRead(notification._id)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-yellow-100 text-yellow-700',
      urgent: 'bg-red-100 text-red-700'
    }
    return colors[priority] || 'bg-gray-100 text-gray-700'
  }

  const getCategoryIcon = (category) => {
    const icons = {
      alert: 'fa-exclamation-triangle',
      reminder: 'fa-clock',
      info: 'fa-info-circle',
      warning: 'fa-exclamation-circle',
      success: 'fa-check-circle'
    }
    return icons[category] || 'fa-bell'
  }

  const getCategoryColor = (category) => {
    const colors = {
      alert: 'text-red-500',
      reminder: 'text-blue-500',
      info: 'text-blue-400',
      warning: 'text-yellow-500',
      success: 'text-green-500'
    }
    return colors[category] || 'text-gray-500'
  }

  const formatDate = (date) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffMs = now - notificationDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return notificationDate.toLocaleDateString()
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">View and manage your notifications</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {user?.role === 'Administrator' && (
              <Link
                to="/notifications/create"
                className="inline-flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
              >
                <i className="fas fa-plus"></i>
                Send Notification
              </Link>
            )}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
              >
                <i className="fas fa-check-double mr-2"></i>
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-48">
            <select
              value={filters.isRead}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Notifications</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>
          <button
            onClick={() => {
              setFilters({ isRead: '' })
              setPagination({ ...pagination, page: 1 })
            }}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-bell-slash text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No notifications found</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                  !notification.isRead ? 'bg-emerald-50/30 border-l-4 border-emerald-500' : ''
                }`}
                onClick={() => handleViewDetails(notification)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`mt-1 ${getCategoryColor(notification.category)}`}>
                    <i className={`fas ${getCategoryIcon(notification.category)} text-lg`}></i>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800 truncate">
                        {notification.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {!notification.isRead && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span>{formatDate(notification.createdAt)}</span>
                      {notification.category && (
                        <span className="capitalize">{notification.category}</span>
                      )}
                      {notification.type && (
                        <span>{notification.type}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-emerald-600 hover:text-emerald-700 text-sm"
                        title="Mark as read"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && notifications.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notifications
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <span className="px-4 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-medium">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {showDetails && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`${getCategoryColor(selectedNotification.category)}`}>
                  <i className={`fas ${getCategoryIcon(selectedNotification.category)} text-xl`}></i>
                </span>
                <h3 className="text-lg font-bold text-gray-800">
                  {selectedNotification.title}
                </h3>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedNotification.priority)}`}>
                  Priority: {selectedNotification.priority}
                </span>
                {selectedNotification.category && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                    {selectedNotification.category}
                  </span>
                )}
                {selectedNotification.type && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {selectedNotification.type}
                  </span>
                )}
                {selectedNotification.isRead ? (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    Read
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    Unread
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedNotification.message}</p>
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <p><span className="font-medium">Received:</span> {new Date(selectedNotification.createdAt).toLocaleString()}</p>
                {selectedNotification.readAt && (
                  <p><span className="font-medium">Read at:</span> {new Date(selectedNotification.readAt).toLocaleString()}</p>
                )}
                {selectedNotification.recipientRole && (
                  <p><span className="font-medium">Target Role:</span> {selectedNotification.recipientRole}</p>
                )}
              </div>

              {selectedNotification.link && (
                <Link
                  to={selectedNotification.link}
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                  onClick={() => setShowDetails(false)}
                >
                  <i className="fas fa-arrow-right"></i>
                  View Related Content
                </Link>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {!selectedNotification.isRead && (
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedNotification._id)
                    setShowDetails(false)
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter