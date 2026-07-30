import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  // 1. Wait for AuthContext to resolve initialization fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600"></i>
          <p className="mt-4 text-gray-600 font-medium">Verifying credentials...</p>
        </div>
      </div>
    )
  }

  // 2. If the user is unauthenticated, send them to login page
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. CRUCIAL FIX: If no specific allowedRoles array is passed, ALLOW entry immediately!
  // This prevents the parent wrapper around <Layout /> from blocking nested pages.
  if (!allowedRoles || allowedRoles.length === 0) {
    return children
  }

  // 4. Safely clean and normalize strings to eliminate white-spaces and case mismatches
  const userRoleClean = user?.role ? user.role.toString().trim() : '';
  const lowerUserRole = userRoleClean.toLowerCase();
  const lowerAllowedRoles = allowedRoles.map(role => role.toString().trim().toLowerCase());

  console.log(`[Route Guard Check] Path: "${location.pathname}" | Current User Role: "${userRoleClean}" | Allowed Roles Required:`, allowedRoles);

  // 5. Match validation checks
  const hasAccess = allowedRoles.includes(userRoleClean) || lowerAllowedRoles.includes(lowerUserRole);

  if (!hasAccess) {
    console.warn(`[Access Denied] User role "${userRoleClean}" blocked from routing path: "${location.pathname}"`);
    return <Navigate to="/dashboard" replace />
  }

  // 6. Access granted
  return children
}

export default ProtectedRoute
