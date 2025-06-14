import React from 'react';
import MaintenanceSidebar from './MaintenanceSidebar';
import SharedLayout from './SharedLayout';

interface MaintenanceLayoutProps {
  children: React.ReactNode;
}

const MaintenanceLayout: React.FC<MaintenanceLayoutProps> = ({ children }) => {
  return (
    <SharedLayout
      sidebar={<MaintenanceSidebar />}
      title="Maintenance Dashboard"
    >
      {children}
    </SharedLayout>
  );
};

export default MaintenanceLayout; 