import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usersAPI } from '../../api/users'
import StatusBadge from '../../components/Common/StatusBadge'
import { ROLES } from '../../constants'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    search: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [filters, pagination.page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        role: filters.role,
        isActive: filters.isActive,
        search: filters.search
      })
      
      setUsers(response.data.data || [])
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      })
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await usersAPI.deactivate(id)
      } else {
        await usersAPI.activate(id)
      }
      fetchUsers()
    } catch (error) {
      alert('Failed to update user status')
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      'Administrator': 'bg-purple-100 text-purple-700',
      'Farm Manager': 'bg-emerald-100 text-emerald-700',
      'Production Supervisor': 'bg-blue-100 text-blue-700',
      'Inventory Officer': 'bg-yellow-100 text-yellow-700',
      'Sales Officer': 'bg-green-100 text-green-700',
      'Farm Worker': 'bg-orange-100 text-orange-700',
      'Customer': 'bg-gray-100 text-gray-700'
    }
    return colors[role] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600 mt-1">Manage system users and their roles</p>
          </div>
          <Link
            to="/users/create"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            <i className="fas fa-user-plus"></i>
            Add User
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-600">
            {users.filter(u => !u.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Administrators</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'Administrator').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name, email, or phone..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Roles</option>
              {Object.values(ROLES).map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              name="isActive"
              value={filters.isActive}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            <i className="fas fa-search mr-2"></i>
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No users found</p>
            <Link
              to="/users/create"
              className="inline-block mt-4 text-emerald-600 hover:underline font-medium"
            >
              Add your first user
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Phone</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Last Login</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-gray-800">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm">{user.email}</td>
                    <td className="px-6 py-3 text-sm">{user.phoneNumber}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={user.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/users/${user._id}`}
                        className="text-emerald-600 hover:text-emerald-700 mr-3"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isActive)}
                        className={`mr-3 ${user.isActive ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <i className={`fas ${user.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete user ${user.fullName}?`)) {
                            usersAPI.delete(user._id).then(() => fetchUsers())
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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
    </div>
  )
}

export default UserList