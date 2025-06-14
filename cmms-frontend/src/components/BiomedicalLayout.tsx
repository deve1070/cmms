import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SharedLayout from './SharedLayout';
import BiomedicalSidebar from './BiomedicalSidebar';
import { getUserDisplayName } from '../types/auth';
import { Stethoscope, Bell, AlertTriangle } from 'lucide-react';

interface BiomedicalLayoutProps {
  children: React.ReactNode;
  title?: string;
  userDisplayName?: string;
}

const BiomedicalLayout: React.FC<BiomedicalLayoutProps> = ({
  children,
  title = 'Biomedical Dashboard',
  userDisplayName,
}) => {
  const { user } = useAuth();

  // Biomedical-specific header content
  const headerContent = (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Stethoscope className="h-5 w-5 text-blue-200" />
        <span className="text-blue-100">Department:</span>
        <span className="text-white font-medium">Biomedical Engineering</span>
      </div>
      <div className="flex items-center space-x-2">
        <Bell className="h-5 w-5 text-blue-200" />
        <span className="text-blue-100">Notifications:</span>
        <span className="text-white font-medium">3 New</span>
      </div>
    </div>
  );

  // Biomedical-specific footer content
  const footerContent = (
    <footer className="w-full py-6 px-6 bg-gradient-to-r from-blue-800 to-indigo-900 text-center text-sm text-blue-100 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 justify-center sm:justify-start mb-4 sm:mb-0">
          <Stethoscope className="h-5 w-5 text-blue-300" />
          <span>© {new Date().getFullYear()} CMMS - Biomedical Engineering Department</span>
        </div>
        <div className="flex space-x-4 justify-center sm:justify-end">
          <a href="/biomedical/equipment" className="text-blue-200 hover:text-white hover:underline">
            Equipment
          </a>
          <a href="/biomedical/work-orders" className="text-blue-200 hover:text-white hover:underline">
            Work Orders
          </a>
          <a href="/biomedical/reports" className="text-blue-200 hover:text-white hover:underline">
            Reports
          </a>
        </div>
      </div>
    </footer>
  );

  return (
    <SharedLayout
      title={title}
      sidebar={<BiomedicalSidebar />}
      headerContent={headerContent}
      footerContent={footerContent}
      userDisplayName={userDisplayName || getUserDisplayName(user)}
    >
      <div className="biomedical-content">
        {children}
      </div>
    </SharedLayout>
  );
};

export default BiomedicalLayout; 