import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../config/permissions';

const MaintenanceTechRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== Role.MAINTENANCE_TECHNICIAN) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default MaintenanceTechRoute; 