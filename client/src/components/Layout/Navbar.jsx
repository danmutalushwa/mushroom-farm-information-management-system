import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notificationsAPI } from '../../api/notifications'

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchUnreadCount()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount()
      setUnreadCount(response.data.data?.count || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <i className="fas fa-bars text-gray-600 text-xl"></i>
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.fullName || 'User'}! 🎉
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Link to="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <i className="fas fa-bell text-gray-600 text-xl"></i>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile */}
        <Link to="/profile" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:block">
            {user?.fullName?.split(' ')[0] || 'User'}
          </span>
        </Link>
      </div>
    </header>
  )
}

export default Navbar