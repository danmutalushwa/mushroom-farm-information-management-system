import React from 'react'

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Planned': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'Ready for Harvest': 'bg-green-100 text-green-700',
      'Completed': 'bg-gray-100 text-gray-700',
      'Cancelled': 'bg-red-100 text-red-700',
      'Active': 'bg-green-100 text-green-700',
      'Inactive': 'bg-gray-100 text-gray-700',
      'Suspended': 'bg-red-100 text-red-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Confirmed': 'bg-blue-100 text-blue-700',
      'Processing': 'bg-purple-100 text-purple-700',
      'Ready for Collection': 'bg-indigo-100 text-indigo-700',
      'Paid': 'bg-green-100 text-green-700',
      'Partially Paid': 'bg-orange-100 text-orange-700',
      'Unpaid': 'bg-red-100 text-red-700',
      'Failed': 'bg-red-100 text-red-700',
      'Refunded': 'bg-gray-100 text-gray-700',
      'Out of Stock': 'bg-red-100 text-red-700',
      'Low Stock': 'bg-yellow-100 text-yellow-700',
      'In Stock': 'bg-green-100 text-green-700',
      'Overstock': 'bg-blue-100 text-blue-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  )
}

export default StatusBadge