import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../config/permissions';

const MaintenanceRoute: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== Role.BIOMEDICAL_ENGINEER) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="space-y-6">
      <Outlet />
    </div>
  );
};

export default MaintenanceRoute;