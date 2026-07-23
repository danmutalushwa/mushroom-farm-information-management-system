import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import loginIllustration from '../../assets/login-illustration.png'

const RegisterCustomer = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    customerType: 'Individual',
    password: '',  
    createdBy: null
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      //Clean data before sending
      const payload = {
        ...formData,
        // Convert empty strings to null for backend compatibility
        email: formData.email || null,
        address: formData.address || null,
        // Explicitly set createdBy to null for public registration
        createdBy: null
      }

      await api.post('/auth/register-customer', payload)

      setSuccess('Registration successful! Please login.')

      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (error) {
      setError(
        error.response?.data?.message || 'Registration failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">

      {/* Left Side - Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-50 items-center justify-center p-16">
        <img
          src={loginIllustration}
          alt="Register Illustration"
          className="max-w-xl w-full object-contain"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12 lg:px-20">

        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-bold text-gray-800">
                Sign
                <span className="text-emerald-600">
                   Up
                </span>
              </span>
            </div>

            <p className="text-gray-500">
              Create your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-5">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm mb-5">
              {success}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Smith"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>

              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+250 788 000 000"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="johnsmith@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Optional - You can skip this
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Kigali, Rwanda"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Optional - You can skip this
              </p>
            </div>

            {/* Customer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type *
              </label>

              <select
                name="customerType"
                value={formData.customerType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Individual">Individual</option>
                <option value="Business">Business</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="Retailer">Retailer</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength="6"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <p className="text-xs text-gray-400 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {
                loading
                  ? <i className="fas fa-spinner fa-spin"></i>
                  : "Create Account"
              }
            </button>

          </form>

          {/* Login Link */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}

            <Link
              to="/login"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </div>

        </div>

      </div>

    </div>
  )
}

export default RegisterCustomer