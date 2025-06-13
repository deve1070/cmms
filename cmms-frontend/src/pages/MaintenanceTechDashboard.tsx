import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  WrenchIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxArrowDownIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi, workOrdersApi, maintenanceApi, sparePartsApi } from '../services/api';
import type { Equipment } from '../types/equipment';
import type { WorkOrder } from '../types/workOrder';
import type { MaintenanceReport } from '../types/maintenance';
import type { SparePart } from '../types/sparePart';

const navigation = [
  { name: 'Dashboard', icon: ChartBarIcon, path: '/maintenance/dashboard' },
  { name: 'My Work Orders', icon: WrenchIcon, path: '/maintenance/work-orders' },
  { name: 'View Schedule', icon: CalendarIcon, path: '/maintenance/schedule' },
  { name: 'Spare Parts Inventory', icon: WrenchScrewdriverIcon, path: '/maintenance/spare-parts' },
  { name: 'My Activity Log', icon: ClipboardDocumentCheckIcon, path: '/maintenance/activity-log' },
];

const MaintenanceTechDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceReport[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to access the dashboard');
          navigate('/login', { replace: true });
          return;
        }

        // Fetch data in parallel
        const [equipmentResponse, workOrdersResponse, maintenanceResponse, sparePartsResponse] = await Promise.all([
          equipmentApi.getAll(),
          workOrdersApi.getAll(),
          maintenanceApi.getAll({}),
          sparePartsApi.getAll()
        ]);

        // Set state without type assertions
        setEquipment(equipmentResponse);
        setWorkOrders(workOrdersResponse);
        setMaintenanceSchedules(maintenanceResponse);
        setSpareParts(sparePartsResponse);

        console.log('Dashboard data loaded:', {
          equipment: equipmentResponse,
          workOrders: workOrdersResponse,
          maintenance: maintenanceResponse,
          spareParts: sparePartsResponse
        });

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          // Clear auth data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
        } else if (error.response?.status === 404) {
          setError('No maintenance records found. This could be because no records have been created yet.');
          // Set empty arrays for the data
          setEquipment([]);
          setWorkOrders([]);
          setMaintenanceSchedules([]);
          setSpareParts([]);
        } else {
          setError(error.response?.data?.error || 'Failed to load dashboard data. Please try again later.');
        }
        toast.error(error.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to logout');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Not Authenticated</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
              <h2 className="text-2xl font-extrabold text-blue-800 tracking-tight">Maintenance</h2>
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
            {navigation.map((item) => (
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
        
        <div className="absolute bottom-0 w-full p-6 border-t border-blue-100">
          <div className="flex items-center space-x-3 mb-4">
            <UserCircleIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">{user?.name || user?.username || user?.email || "Maintenance Tech"}</p>
              <p className="text-sm text-blue-600">Maintenance Technician</p>
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

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-blue-800 ml-4">Maintenance Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {workOrders.filter(wo => wo.status === 'pending').length}
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Dashboard Stats */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-800 mb-4">My Performance Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-medium text-gray-500">My Open Work Orders</h3>
                    <p className="mt-1 text-3xl font-semibold text-blue-800">
                      {workOrders.filter(wo => wo.assignedTo === user?.username && (wo.status === 'pending' || wo.status === 'in_progress')).length}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-medium text-gray-500">Tasks Completed This Week</h3>
                    <p className="mt-1 text-3xl font-semibold text-blue-800">
                      {workOrders.filter(wo => 
                        wo.assignedTo === user?.username && 
                        wo.status === 'completed' && 
                        new Date(wo.completedAt || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                      ).length}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-medium text-gray-500">Low Stock Alerts</h3>
                    <p className="mt-1 text-3xl font-semibold text-red-600">
                      {spareParts.filter(part => part.quantity <= part.minimumQuantity).length}
                    </p>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/maintenance/work-orders')}
                    className="flex items-center justify-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-blue-100 text-blue-700 hover:text-blue-900"
                  >
                    <ClipboardDocumentListIcon className="h-6 w-6" />
                    <span className="font-medium">View My Work Orders</span>
                  </button>
                  <button
                    onClick={() => navigate('/maintenance/spare-parts')}
                    className="flex items-center justify-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-blue-100 text-blue-700 hover:text-blue-900"
                  >
                    <ArchiveBoxArrowDownIcon className="h-6 w-6" />
                    <span className="font-medium">Log Part Usage</span>
                  </button>
                  <button
                    onClick={() => navigate('/maintenance/spare-parts')}
                    className="flex items-center justify-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-blue-100 text-blue-700 hover:text-blue-900"
                  >
                    <PaperAirplaneIcon className="h-6 w-6" />
                    <span className="font-medium">Request Part Restock</span>
                  </button>
                </div>
              </section>

              {/* Recent Work Orders */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-blue-800 mb-4">Recent Work Orders</h2>
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {workOrders
                          .filter(wo => wo.assignedTo === user?.username)
                          .slice(0, 5)
                          .map((workOrder) => (
                            <tr key={workOrder.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-800">{workOrder.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {equipment.find(e => e.id === workOrder.equipmentId)?.name || 'Unknown Equipment'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{workOrder.description}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  'completed' ? 'bg-green-100 text-green-800' :
                                  'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {'completed'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{workOrder.priority}</td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Upcoming Maintenance */}
              <section>
                <h2 className="text-xl font-bold text-blue-800 mb-4">Upcoming Maintenance</h2>
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {maintenanceSchedules
                          .slice(0, 5)
                          .map((schedule) => (
                            <tr key={schedule.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-800">
                                {equipment.find(e => e.id === schedule.equipmentId)?.name || 'Unknown Equipment'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schedule.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(schedule.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  'completed' ? 'bg-green-100 text-green-800' :
                                  'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {'completed'}
                                </span>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MaintenanceTechDashboard; 