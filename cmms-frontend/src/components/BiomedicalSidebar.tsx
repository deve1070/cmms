import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  Package2,
  FileText,
  Plus,
  ClipboardCheck,
  User as UserIcon,
  LogOut,
} from 'lucide-react';

const BiomedicalSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user || user.role.toLowerCase() !== 'biomedical_engineer') return null;

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
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors mt-auto"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </nav>
  );
};

export default BiomedicalSidebar;