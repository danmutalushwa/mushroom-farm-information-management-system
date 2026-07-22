import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Profile = () => {
  const { user } = useAuth()

  return (
    <div>
      <div className="gradient-header rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account details</p>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{user?.fullName}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Full Name</label>
            <p className="font-medium text-gray-800">{user?.fullName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="font-medium text-gray-800">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone Number</label>
            <p className="font-medium text-gray-800">{user?.phoneNumber}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Role</label>
            <p className="font-medium text-gray-800">{user?.role}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <p className="font-medium text-gray-800">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <Link
            to="/profile/change-password"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition font-medium"
          >
            <i className="fas fa-key"></i>
            Change Password
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Profile