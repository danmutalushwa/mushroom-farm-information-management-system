import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import loginIllustration from '../../assets/login-illustration.png'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // API call for forgot password
      // await api.post('/auth/forgot-password', { email })

      setSuccess(true)

    } catch (error) {
      setError(
        error.response?.data?.message || 'Failed to send reset email'
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
          alt="Forgot Password Illustration"
          className="max-w-xl w-full object-contain"
        />

      </div>



      {/* Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12 lg:px-20">

        <div className="w-full max-w-md">


          {/* Logo */}
          <div className="mb-8">

            <div className="flex items-center gap-3 mb-3">

              {/* <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center text-white font-bold">
                FP
              </div> */}


              <span className="text-2xl font-bold text-gray-800">
                Forgot 
                <span className="text-emerald-600">
                   Password
                </span>
              </span>

            </div>


            <p className="text-gray-500">
              Reset your password
            </p>

          </div>




          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-5">
              {error}
            </div>
          )}






          {success ? (

            /* Success Message */
            <div className="text-center">

              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">

                <i className="fas fa-check text-2xl text-green-600"></i>

              </div>


              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Check Your Email
              </h3>


              <p className="text-sm text-gray-500 mb-8">
                We've sent a password reset link to your email address.
              </p>



              <Link
                to="/login"
                className="inline-block gradient-bg text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition"
              >
                Back to Sign In
              </Link>


            </div>


          ) : (


            <>

              <p className="text-sm text-gray-500 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>



              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >


                {/* Email */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>


                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="johnsmith@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition focus:ring-2 focus:ring-emerald-500"
                  />


                </div>




                {/* Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-bg text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >

                  {
                    loading
                    ? <i className="fas fa-spinner fa-spin"></i>
                    : "Send Reset Link"
                  }

                </button>



              </form>




              {/* Login Link */}
              <div className="mt-8 text-center text-sm text-gray-500">

                Remember your password?{' '}

                <Link
                  to="/login"
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Sign In
                </Link>

              </div>


            </>

          )}

        </div>

      </div>


    </div>
  )
}

export default ForgotPassword