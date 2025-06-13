import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const BiomedicalSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/biomedical/dashboard', icon: HomeIcon },
    { name: 'Equipment', href: '/biomedical/equipment', icon: WrenchScrewdriverIcon },
    { name: 'Work Orders', href: '/biomedical/work-orders', icon: ClipboardDocumentListIcon },
    { name: 'Reports', href: '/biomedical/reports', icon: ChartBarIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: isSidebarOpen ? 0 : -280 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 h-full w-72 bg-white/90 backdrop-blur-lg shadow-2xl z-30 border-r border-blue-100"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600 drop-shadow" />
            <h2 className="text-2xl font-extrabold text-blue-800 tracking-tight">Biomedical</h2>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`flex items-center space-x-3 w-full p-3 rounded-xl text-blue-800 font-medium transition-all shadow-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700'
                    : 'hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-purple-700'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-6 border-t border-blue-100">
        <div className="flex items-center space-x-3 mb-4">
          <UserCircleIcon className="h-8 w-8 text-blue-600" />
          <div>
            <p className="font-medium text-blue-800">{user?.name || user?.username || user?.email || "Biomedical Engineer"}</p>
            <p className="text-sm text-blue-600">Biomedical Engineer</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full p-3 rounded-xl text-blue-800 font-medium hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6" />
          <span>Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default BiomedicalSidebar; 