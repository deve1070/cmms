import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BiomedicalLayout from './BiomedicalLayout';

const BiomedicalRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

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

  if (user.role.toLowerCase() !== 'biomedical_engineer') {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <BiomedicalLayout>
      <Outlet />
    </BiomedicalLayout>
  );
};

export default BiomedicalRoute;