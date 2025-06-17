import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SharedLayout from './SharedLayout';
import BiomedicalSidebar from './BiomedicalSidebar';
import { getUserDisplayName } from '../types/auth';
import { Role } from '../config/permissions';

const BiomedicalRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== Role.BIOMEDICAL_ENGINEER) {
    return <Navigate to="/unauthorized" replace />;
  }

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Biomedical Engineer Dashboard';
    if (path.includes('/equipment')) return 'Equipment Management';
    if (path.includes('/work-orders')) return 'Work Orders';
    if (path.includes('/reports')) return 'Reports';
    return 'Biomedical Dashboard';
  };

  return (
    <SharedLayout
      title={getPageTitle()}
      sidebar={<BiomedicalSidebar />}
      userDisplayName={getUserDisplayName(user, 'Biomedical Engineer')}
    >
      <Outlet />
    </SharedLayout>
  );
};

export default BiomedicalRoute;