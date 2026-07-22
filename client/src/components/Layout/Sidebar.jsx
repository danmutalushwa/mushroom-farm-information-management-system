import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: 'fa-gauge-high', 
      label: 'Dashboard',
      roles: ['Administrator', 'Production Supervisor', 'Inventory Officer', 'Sales Officer', 'Farm Worker', 'Customer']
    },
    { 
      path: '/production', 
      icon: 'fa-seedling', 
      label: 'Production',
      roles: ['Administrator', 'Production Supervisor']
    },
    { 
      path: '/inventory', 
      icon: 'fa-warehouse', 
      label: 'Inventory',
      roles: ['Administrator', 'Inventory Officer']
    },
    { 
      path: '/customers', 
      icon: 'fa-users', 
      label: 'Customers',
      roles: ['Administrator', 'Sales Officer']
    },
    { 
      path: '/orders', 
      icon: 'fa-cart-shopping', 
      label: 'Orders',
      roles: ['Administrator', 'Sales Officer', 'Customer']
    },
    { 
      path: '/sales', 
      icon: 'fa-coins', 
      label: 'Sales',
      roles: ['Administrator', 'Sales Officer']
    },
    { 
      path: '/reports', 
      icon: 'fa-chart-bar', 
      label: 'Reports',
      roles: ['Administrator', 'Production Supervisor', 'Inventory Officer', 'Sales Officer']
    },
    { 
      path: '/notifications', 
      icon: 'fa-bell', 
      label: 'Notifications',
      roles: ['Administrator', 'Production Supervisor', 'Inventory Officer', 'Sales Officer', 'Farm Worker', 'Customer']
    },
    { 
      path: '/users', 
      icon: 'fa-user-gear', 
      label: 'Users',
      roles: ['Administrator']
    },
    { 
      path: '/settings', 
      icon: 'fa-gear', 
      label: 'Settings',
      roles: ['Administrator']
    },
  ]

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(user?.role) || user?.role === 'Administrator'
  )

  return (
    <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          MF
        </div>
        {sidebarOpen && (
          <span className="text-lg font-bold text-gray-800">Mushroom<span className="text-emerald-600">Farm</span></span>
        )}
      </div>

      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all sidebar-item ${isActive ? 'active bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`
            }
          >
            <i className={`fas ${item.icon} w-5 text-center text-lg`}></i>
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}

        {/* Logout - Always at bottom */}
        <div className="absolute bottom-4 left-3 right-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-all"
          >
            <i className="fas fa-sign-out-alt w-5 text-center text-lg"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar