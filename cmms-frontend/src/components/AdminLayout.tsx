import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../config/permissions';
import SharedLayout from './SharedLayout';
import {
  Users,
  Settings,
  Wrench,
  ClipboardList,
  FileText,
  Activity,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== Role.ADMIN) {
    return <div>Unauthorized</div>;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Settings },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Equipment', href: '/admin/equipment', icon: Wrench },
    { name: 'Maintenance Schedule', href: '/admin/maintenance-schedule', icon: ClipboardList },
    { name: 'Maintenance Reports', href: '/admin/maintenance-reports', icon: FileText },
    { name: 'Budgets', href: '/admin/budgets', icon: DollarSign },
    { name: 'Compliance', href: '/admin/compliance', icon: ShieldCheck },
    { name: 'Activity Log', href: '/admin/activity-log', icon: Activity },
  ];

  const sidebar = (
    <nav className="p-4 space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <SharedLayout
      sidebar={sidebar}
      title="Admin Dashboard"
      userDisplayName={user.username}
    >
      <Outlet />
    </SharedLayout>
  );
};

export default AdminLayout;