import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  Package2,
  FileText,
  Plus,
  ClipboardCheck,
  User as UserIcon,
  Settings,
  AlertTriangle,
  Wrench,
  Calendar,
} from 'lucide-react';
import { Role } from '../config/permissions';

const BiomedicalSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== Role.BIOMEDICAL_ENGINEER) return null;

  const navItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/biomedical/dashboard' },
    { name: 'Equipment', icon: Package2, path: '/biomedical/equipment' },
    { name: 'Work Orders', icon: Wrench, path: '/biomedical/work-orders' },
    { name: 'Maintenance Reports', icon: FileText, path: '/biomedical/reports' },
    { name: 'Equipment Faults', icon: AlertTriangle, path: '/biomedical/faults' },
    { name: 'Schedule', icon: Calendar, path: '/biomedical/schedule' },
    { name: 'Add Equipment', icon: Plus, path: '/biomedical/equipment/add' },
    { name: 'Settings', icon: Settings, path: '/biomedical/settings' },
  ];

  return (
    <nav className="flex flex-col space-y-1 p-4">
      <div className="flex items-center space-x-2 p-3 mb-4">
        <UserIcon className="h-6 w-6 text-blue-600" />
        <div>
          <span className="text-sm font-medium text-gray-800">{user?.username || 'User'}</span>
          <p className="text-xs text-gray-500">Biomedical Engineer</p>
        </div>
      </div>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BiomedicalSidebar;