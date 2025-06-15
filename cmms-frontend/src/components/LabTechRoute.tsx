import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SharedLayout from './SharedLayout';
import { getUserDisplayName } from '../types/auth';
import { Role } from '../config/permissions';
import { Link } from 'react-router-dom';
import {
  Beaker,
  FileText,
  Bell,
  Wrench,
  Settings,
  LogOut
} from 'lucide-react';

const sidebar = (
  <nav className="flex flex-col space-y-1 p-4">
    {[
      { name: 'Dashboard', icon: Beaker, path: '/lab/dashboard' },
      { name: 'Equipment', icon: Beaker, path: '/lab/equipment' },
      { name: 'Maintenance', icon: Wrench, path: '/lab/maintenance' },
      { name: 'Reports', icon: FileText, path: '/lab/reports' },
      { name: 'Notifications', icon: Bell, path: '/lab/notifications' },
      { name: 'Settings', icon: Settings, path: '/lab/settings' },
    ].map((item) => (
      <Link
        key={item.name}
        to={item.path}
        className="flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
      >
        <item.icon className="h-5 w-5" />
        <span>{item.name}</span>
      </Link>
    ))}
  </nav>
);

const LabTechRoute: React.FC = () => {
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

  if (user.role !== Role.LAB_TECHNICIAN) {
    return <Navigate to="/unauthorized" replace />;
  }

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Lab Technician Dashboard';
    if (path.includes('/equipment')) return 'Equipment Management';
    if (path.includes('/maintenance')) return 'Maintenance Requests';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/settings')) return 'Settings';
    return 'Lab Technician Portal';
  };

  return (
    <SharedLayout
      title={getPageTitle()}
      sidebar={sidebar}
      userDisplayName={getUserDisplayName(user, 'Lab Technician')}
    >
      <Outlet />
    </SharedLayout>
  );
};

export default LabTechRoute; 