import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Beaker,
  ClipboardList,
  AlertTriangle,
  BarChart,
  UserCircle,
  LogOut,
  Wrench,
  FileText,
  BarChart2,
  Calendar,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName } from '../types/auth';

interface SidebarItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Overview', icon: BarChart, path: '/dashboard' },
  { name: 'Report Issue', icon: AlertTriangle, path: '/dashboard/report' },
  { name: 'Equipment List', icon: Beaker, path: '/dashboard/equipment' },
  { name: 'My Reports', icon: ClipboardList, path: '/dashboard/reports' },
];

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const dashboardCards = [
    {
      title: 'Work Orders',
      description: 'View and manage work orders',
      icon: ClipboardList,
      link: '/work-orders',
      color: 'bg-blue-500',
    },
    {
      title: 'Equipment',
      description: 'View and manage equipment',
      icon: Wrench,
      link: '/equipment',
      color: 'bg-green-500',
    },
    {
      title: 'Reports',
      description: 'View and generate reports',
      icon: FileText,
      link: '/reports',
      color: 'bg-yellow-500',
    },
    {
      title: 'Analytics',
      description: 'View analytics and metrics',
      icon: BarChart2,
      link: '/analytics',
      color: 'bg-purple-500',
    },
    {
      title: 'Schedule',
      description: 'View and manage schedule',
      icon: Calendar,
      link: '/schedule',
      color: 'bg-red-500',
    },
    {
      title: 'Alerts',
      description: 'View and manage alerts',
      icon: AlertCircle,
      link: '/alerts',
      color: 'bg-orange-500',
    },
    {
      title: 'New Work Order',
      description: 'Create a new work order',
      icon: PlusCircle,
      link: '/work-orders/new',
      color: 'bg-teal-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-70 bg-white shadow-lg z-30"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Lab Tech Portal</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Close sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <item.icon className="h-6 w-6" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-6 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <UserCircle className="h-8 w-8 text-gray-600" />
            <div>
              <p className="font-medium text-gray-800">{getUserDisplayName(user, 'Lab Tech')}</p>
              <p className="text-sm text-gray-500">Lab Technician</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-6 w-6" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-70' : 'ml-0'}`}>
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </header>

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome, {getUserDisplayName(user, 'Lab Tech')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dashboardCards.map((card) => (
              <Link
                key={card.title}
                to={card.link}
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${card.color} text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{card.title}</h2>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;