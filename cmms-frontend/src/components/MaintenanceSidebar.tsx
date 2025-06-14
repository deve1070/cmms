import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  Wrench,
  Calendar,
  Package2,
  ClipboardCheck,
  User as UserIcon,
  LogOut,
} from 'lucide-react';

const MaintenanceSidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/engineer/dashboard' },
    { name: 'My Work Orders', icon: Wrench, path: '/engineer/work-orders' },
    { name: 'View Schedule', icon: Calendar, path: '/engineer/schedule' },
    { name: 'Spare Parts Inventory', icon: Package2, path: '/engineer/spare-parts' },
    { name: 'My Activity Log', icon: ClipboardCheck, path: '/engineer/activity-log' },
  ];

  return (
    <nav className="flex flex-col space-y-1 p-4 bg-white border-r border-gray-200 h-full">
      <div className="flex items-center space-x-2 p-3 mb-4">
        <UserIcon className="h-6 w-6 text-gray-600" />
        <span className="text-sm font-medium text-gray-800">{user?.username || 'User'}</span>
      </div>
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className="flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </Link>
      ))}
      <button
        onClick={logout}
        className="flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors mt-auto"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </nav>
  );
};

export default MaintenanceSidebar;