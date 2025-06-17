import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../config/permissions';

const MaintenanceTechRoute: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== Role.MAINTENANCE_TECHNICIAN) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default MaintenanceTechRoute; 