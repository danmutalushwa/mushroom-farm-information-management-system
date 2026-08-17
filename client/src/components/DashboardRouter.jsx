import React from 'react';
import { useAuth } from '../context/AuthContext';

import AdminDashboard from '../pages/dashboard/AdminDashboard';
import ProductionDashboard from '../pages/dashboard/ProductionDashboard';
import InventoryDashboard from '../pages/dashboard/InventoryDashboard';
import SalesDashboard from '../pages/dashboard/SalesDashboard';
import FarmWorkerDashboard from '../pages/dashboard/FarmWorkerDashboard';
import FarmManagerDashboard from '../pages/dashboard/FarmManagerDashboard';
import CustomerDashboard from '../pages/dashboard/CustomerDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'Administrator':
      return <AdminDashboard />;
    case 'Production Supervisor':
      return <ProductionDashboard />;
    case 'Inventory Officer':
      return <InventoryDashboard />;
    case 'Sales Officer':
      return <SalesDashboard />;
    case 'Customer':
      return <CustomerDashboard />;
    case 'Farm Manager':
      return <FarmManagerDashboard />
    case 'Farm Worker':
      return <FarmWorkerDashboard />;
    default:
      return (
        <div className="p-8 text-center bg-white rounded-lg shadow border border-gray-100 max-w-md mx-auto mt-12">
          <i className="fas fa-exclamation-triangle text-amber-500 text-3xl mb-3"></i>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Access Restrained</h2>
          <p className="text-gray-500 text-sm">Your account role type ("{user?.role || 'unknown'}") does not have an assigned workspace layout.</p>
        </div>
      );
  }
};

export default DashboardRouter;
