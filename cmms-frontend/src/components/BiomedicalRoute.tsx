import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BiomedicalLayout from './BiomedicalLayout';

interface BiomedicalRouteProps {
  children: React.ReactNode;
}

const BiomedicalRoute: React.FC<BiomedicalRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role.toLowerCase() !== 'biomedical engineer') {
    return <Navigate to="/welcome" />;
  }

  return <BiomedicalLayout>{children}</BiomedicalLayout>;
};

export default BiomedicalRoute; 