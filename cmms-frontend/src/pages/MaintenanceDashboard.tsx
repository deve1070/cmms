import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ChartBarIcon,
  ClipboardIcon,
  CogIcon,
  DocumentTextIcon,
  HomeIcon,
  WrenchIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Overview', icon: HomeIcon, path: '/maintenance/dashboard' },
  { name: 'Pending Requests', icon: ClipboardIcon, path: '/maintenance/pending-requests' },
  { name: 'Report Maintenance', icon: DocumentTextIcon, path: '/maintenance/report' },
  { name: 'Maintenance History', icon: ChartBarIcon, path: '/maintenance/history' },
  { name: 'Settings', icon: CogIcon, path: '/maintenance/settings' },
];

const recentActivities = [
  {
    id: 1,
    action: 'New maintenance request',
    details: 'Microscope XYZ needs calibration',
    time: '5 minutes ago',
    icon: WrenchIcon,
    color: 'text-blue-500',
  },
  {
    id: 2,
    action: 'Maintenance completed',
    details: 'Centrifuge ABC has been serviced',
    time: '1 hour ago',
    icon: CheckCircleIcon,
    color: 'text-green-500',
  },
  {
    id: 3,
    action: 'Urgent repair needed',
    details: 'Autoclave in Lab 3 is not heating',
    time: '2 hours ago',
    icon: ExclamationTriangleIcon,
    color: 'text-red-500',
  },
];

const MaintenanceDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full flex overflow-x-hidden bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isSidebarOpen ? 288 : 0 }}
        transition={{ duration: 0.3 }}
        className="h-screen bg-white shadow-lg overflow-hidden"
      >
        <div className="h-full p-6 flex flex-col justify-between">
          {/* Top Section */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-2">
                <WrenchIcon className="h-8 w-8 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-800">Maintenance</h2>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
                <XMarkIcon className="h-6 w-6 text-gray-500" />
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

          {/* Bottom Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <UserCircleIcon className="h-8 w-8 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">
                  {user?.name || user?.username || user?.email || 'Technician'}
                </p>
                <p className="text-sm text-gray-500">Maintenance Staff</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 w-full transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 mr-4"
                  aria-label="Open sidebar"
                >
                  <Bars3Icon className="h-6 w-6 text-gray-600" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-800">Maintenance Dashboard</h1>
            </div>
            <button className="p-2 relative hover:bg-gray-100 rounded-lg">
              <BellIcon className="h-6 w-6 text-gray-600" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                3
              </span>
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Pending Requests" value="12" icon={ClipboardIcon} color="blue" note="3 urgent" />
            <StatCard title="Completed Today" value="8" icon={CheckCircleIcon} color="green" note="+2 from yesterday" />
            <StatCard title="Scheduled Tasks" value="15" icon={ClockIcon} color="yellow" note="Next 7 days" />
            <StatCard title="Equipment Status" value="92%" icon={WrenchIcon} color="purple" note="Operational" />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className={`p-2 rounded-lg ${activity.color} bg-opacity-10`}>
                    <activity.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.details}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, note }: any) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <Icon className={`h-8 w-8 text-${color}-500`} />
    </div>
    <p className={`text-4xl font-bold text-${color}-600`}>{value}</p>
    <p className="text-sm text-gray-500 mt-2">{note}</p>
  </div>
);

export default MaintenanceDashboard;
