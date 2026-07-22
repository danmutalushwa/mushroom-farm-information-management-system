import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usersAPI } from '../../api/users'
import StatusBadge from '../../components/Common/StatusBadge'
import { ROLES } from '../../constants'

const UserDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUserDetails()
  }, [id])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getById(id)
      setUser(response.data.data)
      setFormData(response.data.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await usersAPI.update(id, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        role: formData.role
      })
      setSuccess('User updated successfully!')
      setIsEditing(false)
      fetchUserDetails()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleUpdate = async (newRole) => {
    try {
      await usersAPI.updateRole(id, { role: newRole })
      fetchUserDetails()
    } catch (error) {
      alert('Failed to update role')
    }
  }

  const toggleStatus = async () => {
    try {
      if (user.isActive) {
        await usersAPI.deactivate(id)
      } else {
        await usersAPI.activate(id)
      }
      fetchUserDetails()
    } catch (error) {
      alert('Failed to update status')
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      'Administrator': 'bg-purple-100 text-purple-700',
      'Production Supervisor': 'bg-blue-100 text-blue-700',
      'Inventory Officer': 'bg-yellow-100 text-yellow-700',
      'Sales Officer': 'bg-green-100 text-green-700',
      'Farm Worker': 'bg-orange-100 text-orange-700',
      'Customer': 'bg-gray-100 text-gray-700'
    }
    return colors[role] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <i className="fas fa-spinner fa-spin text-3xl text-emerald-600"></i>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-user text-4xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">User not found</p>
        <Link to="/users" className="inline-block mt-4 text-emerald-600 hover:underline">
          Back to Users
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{user.fullName}</h1>
              <StatusBadge status={user.isActive ? 'Active' : 'Inactive'} />
            </div>
            <p className="text-gray-600 mt-1">{user.email} • {user.phoneNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'} mr-2`}></i>
              {isEditing ? 'Cancel Edit' : 'Edit'}
            </button>
            <button
              onClick={toggleStatus}
              className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                user.isActive 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <i className={`fas ${user.isActive ? 'fa-pause' : 'fa-play'} mr-2`}></i>
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => navigate('/users')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">
              {isEditing ? 'Edit User Information' : 'User Information'}
            </h3>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white"
                    required
                  >
                    {Object.values(ROLES).map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full gradient-bg text-white font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Update User'}
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <p className="font-medium text-gray-800">{user.fullName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium text-gray-800">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone Number</label>
                  <p className="font-medium text-gray-800">{user.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p className="font-medium text-gray-800">
                    <StatusBadge status={user.isActive ? 'Active' : 'Inactive'} />
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Last Login</label>
                  <p className="font-medium text-gray-800">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Joined</label>
                  <p className="font-medium text-gray-800">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Change Role</h3>
            <div className="space-y-2">
              {Object.values(ROLES).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    if (role !== user.role && window.confirm(`Change role to "${role}"?`)) {
                      handleRoleUpdate(role)
                    }
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                    role === user.role 
                      ? `bg-emerald-50 text-emerald-700 cursor-default` 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  disabled={role === user.role}
                >
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    role === user.role ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}></span>
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Danger Zone</h3>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
                  usersAPI.delete(id).then(() => navigate('/users'))
                }
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              <i className="fas fa-trash mr-2"></i>
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetails