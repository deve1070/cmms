import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  Package2,
  FileText,
  Plus,
  ClipboardCheck,
  User as UserIcon,
} from 'lucide-react';

const BiomedicalSidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role.toLowerCase() !== 'biomedical engineer') return null;

  const navItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/biomedical/dashboard' },
    { name: 'Equipment', icon: Package2, path: '/biomedical/equipment' },
    { name: 'Work Orders', icon: FileText, path: '/biomedical/work-orders' },
    { name: 'Add Equipment', icon: Plus, path: '/biomedical/equipment/add' },
    { name: 'Reports', icon: ClipboardCheck, path: '/biomedical/reports' },
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
    </nav>
  );
};

export default BiomedicalSidebar;