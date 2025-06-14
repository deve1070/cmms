import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MaintenanceLayout from './MaintenanceLayout';
import { FrontendUserRole } from '../types/auth';

interface MaintenanceRouteProps {
  children: React.ReactNode;
}

const MaintenanceRoute: React.FC<MaintenanceRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Type-safe role checking
  const allowedRoles: FrontendUserRole[] = ['engineer for maintenance'];
  if (!allowedRoles.includes(user.role as FrontendUserRole)) {
    return <Navigate to="/welcome" replace />;
  }

  return <MaintenanceLayout>{children}</MaintenanceLayout>;
};

export default MaintenanceRoute;