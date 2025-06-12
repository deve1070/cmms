import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BeakerIcon,
  WrenchIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface SidebarItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Overview', icon: ChartBarIcon, path: '/maintech/dashboard' },
  { name: 'Equipment List', icon: BeakerIcon, path: '/maintech/equipment' },
  { name: 'Maintenance Tasks', icon: WrenchIcon, path: '/maintech/tasks' },
  { name: 'Reports', icon: ClipboardDocumentListIcon, path: '/maintech/reports' },
];

// Mock data for equipment status
const equipmentStatus = [
  { id: 1, name: 'Microscope XYZ', status: 'Operational', lastMaintenance: '2024-02-15', nextMaintenance: '2024-05-15' },
  { id: 2, name: 'Centrifuge ABC', status: 'Needs Calibration', lastMaintenance: '2024-01-20', nextMaintenance: '2024-04-20' },
  { id: 3, name: 'Autoclave 123', status: 'Maintenance Due', lastMaintenance: '2024-02-01', nextMaintenance: '2024-03-01' },
];

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    type: 'maintenance',
    title: 'Scheduled Maintenance',
    description: 'Microscope XYZ calibration due',
    time: '2 hours ago',
    status: 'pending',
  },
  {
    id: 2,
    type: 'repair',
    title: 'Repair Request',
    description: 'Centrifuge ABC needs attention',
    time: '4 hours ago',
    status: 'in-progress',
  },
  {
    id: 3,
    type: 'inspection',
    title: 'Equipment Inspection',
    description: 'Quarterly lab equipment check',
    time: '1 day ago',
    status: 'completed',
  },
];

const MainTechDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'needs calibration':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance due':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-72 bg-white/90 backdrop-blur-lg shadow-2xl z-30 border-r border-blue-100"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              <WrenchIcon className="h-8 w-8 text-blue-600 drop-shadow" />
              <h2 className="text-2xl font-extrabold text-blue-800 tracking-tight">MainTech Portal</h2>
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
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="flex items-center space-x-3 w-full p-3 rounded-xl text-blue-800 font-medium hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-purple-700 transition-all shadow-sm"
              >
                <item.icon className="h-6 w-6" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-6 border-t border-blue-100 bg-white/80 backdrop-blur">
          <div className="flex items-center space-x-3 mb-4">
            <UserCircleIcon className="h-8 w-8 text-blue-400" />
            <div>
              <p className="font-semibold text-blue-900">{user?.name || user?.username || user?.email || "MainTech User"}</p>
              <p className="text-xs text-blue-500">Maintenance Technician</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-semibold shadow-sm"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Top Navigation Bar */}
        <nav className="bg-white/80 backdrop-blur shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-blue-100 mr-4 transition-colors duration-200"
                  aria-label="Toggle sidebar"
                >
                  <Bars3Icon className="h-6 w-6 text-blue-600" />
                </button>
                <span className="text-2xl font-extrabold text-blue-800 tracking-tight">MainTech Portal</span>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-blue-100 relative transition-colors">
                  <BellIcon className="h-6 w-6 text-blue-600" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center shadow-md">
                    3
                  </span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900 tracking-tight">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <button className="flex items-center justify-center space-x-2 p-5 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow hover:shadow-lg transition-all text-blue-700 font-semibold hover:scale-105">
              <PlusIcon className="h-6 w-6 text-blue-600" />
              <span>New Maintenance</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-5 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl shadow hover:shadow-lg transition-all text-green-700 font-semibold hover:scale-105">
              <WrenchIcon className="h-6 w-6 text-green-600" />
              <span>Report Issue</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow hover:shadow-lg transition-all text-purple-700 font-semibold hover:scale-105">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
              <span>Schedule Check</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-5 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl shadow hover:shadow-lg transition-all text-yellow-700 font-semibold hover:scale-105">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
              <span>View Reports</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white/90 rounded-2xl shadow-lg p-8 border-t-4 border-red-300 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-500 uppercase tracking-wide">Active Issues</p>
                <p className="text-3xl font-extrabold text-blue-900">12</p>
              </div>
              <ExclamationTriangleIcon className="h-10 w-10 text-red-400 drop-shadow" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600 font-semibold">
                <span>↓ 2</span>
                <span className="mx-1 text-gray-400 font-normal">from last week</span>
              </div>
            </div>
          </div>
          <div className="bg-white/90 rounded-2xl shadow-lg p-8 border-t-4 border-green-300 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-500 uppercase tracking-wide">Equipment Status</p>
                <p className="text-3xl font-extrabold text-blue-900">85%</p>
              </div>
              <BeakerIcon className="h-10 w-10 text-green-400 drop-shadow" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600 font-semibold">
                <span>↑ 5%</span>
                <span className="mx-1 text-gray-400 font-normal">from last month</span>
              </div>
            </div>
          </div>
          <div className="bg-white/90 rounded-2xl shadow-lg p-8 border-t-4 border-yellow-300 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-yellow-500 uppercase tracking-wide">Pending Tasks</p>
                <p className="text-3xl font-extrabold text-blue-900">8</p>
              </div>
              <ClipboardDocumentListIcon className="h-10 w-10 text-yellow-400 drop-shadow" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-red-600 font-semibold">
                <span>↑ 3</span>
                <span className="mx-1 text-gray-400 font-normal">from yesterday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Status and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Equipment Status */}
          <div className="bg-white/90 rounded-2xl shadow-lg">
            <div className="p-6 border-b border-blue-100">
              <h3 className="text-lg font-bold text-blue-900">Equipment Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {equipmentStatus.map((equipment) => (
                  <div key={equipment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <div>
                      <p className="font-semibold text-blue-900">{equipment.name}</p>
                      <p className="text-xs text-blue-500">Last maintenance: {equipment.lastMaintenance}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(equipment.status)} shadow-sm`}>{equipment.status}</span>
                      <button className="p-2 text-blue-400 hover:text-blue-600 transition-colors">
                        <WrenchIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/90 rounded-2xl shadow-lg">
            <div className="p-6 border-b border-blue-100">
              <h3 className="text-lg font-bold text-blue-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'completed' ? 'bg-green-100' :
                      activity.status === 'in-progress' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {activity.type === 'maintenance' ? <WrenchIcon className="h-5 w-5 text-blue-600" /> :
                       activity.type === 'repair' ? <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" /> :
                       <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">{activity.title}</p>
                      <p className="text-xs text-blue-500">{activity.description}</p>
                    </div>
                    <div className="flex items-center text-xs text-blue-400">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainTechDashboard; 