import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi, workOrdersApi, maintenanceApi, sparePartsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
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
  ClipboardDocumentCheckIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface SidebarItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

interface Equipment {
  id: string;
  serialNumber: string;
  model: string;
  location: string;
  status: string;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface WorkOrder {
  id: string;
  equipmentId: string;
  issue: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  type: 'preventive' | 'corrective';
  status: 'pending' | 'in_progress' | 'completed';
  scheduledDate: string;
  description: string;
  equipment: {
    model: string;
    serialNumber: string;
    location: string;
  };
}

interface SparePart {
  id: string;
  name: string;
  quantity: number;
  minimumQuantity: number;
  location: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', icon: ChartBarIcon, path: '/maintenance/dashboard' },
  { name: 'My Work Orders', icon: WrenchIcon, path: '/maintenance/work-orders' },
  { name: 'Maintenance Schedule', icon: CalendarIcon, path: '/maintenance/schedule' },
  { name: 'Spare Parts', icon: CogIcon, path: '/maintenance/spare-parts' },
  { name: 'Reports', icon: ClipboardDocumentCheckIcon, path: '/maintenance/reports' },
];

const MaintenanceTechDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add a debug message to verify component mounting
  console.log('MaintenanceTechDashboard component mounted');
  console.log('Current state:', { isLoading, error, user });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Starting to fetch dashboard data...');
        setIsLoading(true);
        setError(null);

        // Fetch data in parallel
        console.log('Fetching equipment data...');
        const equipmentResponse = await equipmentApi.getAll().catch(err => {
          console.error('Error fetching equipment:', err);
          return [] as Equipment[];
        }) as Equipment[];
        console.log('Equipment data:', equipmentResponse);

        console.log('Fetching work orders data...');
        const workOrdersResponse = await workOrdersApi.getAll().catch(err => {
          console.error('Error fetching work orders:', err);
          return [] as WorkOrder[];
        }) as WorkOrder[];
        console.log('Work orders data:', workOrdersResponse);

        console.log('Fetching maintenance schedules data...');
        const maintenanceResponse = await maintenanceApi.getAll({}).catch(err => {
          console.error('Error fetching maintenance schedules:', err);
          return [] as MaintenanceSchedule[];
        }) as MaintenanceSchedule[];
        console.log('Maintenance schedules data:', maintenanceResponse);

        console.log('Fetching spare parts data...');
        const sparePartsResponse = await sparePartsApi.getAll().catch(err => {
          console.error('Error fetching spare parts:', err);
          return [] as SparePart[];
        }) as SparePart[];
        console.log('Spare parts data:', sparePartsResponse);

        setEquipment(equipmentResponse);
        setWorkOrders(workOrdersResponse);
        setMaintenanceSchedules(maintenanceResponse);
        setSpareParts(sparePartsResponse);

        // Show success message if any data was loaded
        if (
          equipmentResponse.length ||
          workOrdersResponse.length ||
          maintenanceResponse.length ||
          sparePartsResponse.length
        ) {
          toast.success('Dashboard data loaded successfully');
        } else {
          console.log('No data was loaded from any API endpoint');
          setError('No data available. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Add a simple initial render to verify the component is working
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
          <p className="text-sm text-gray-500 mt-2">Debug: Component is in loading state</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
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

  // Add a debug message before the main render
  console.log('Rendering main dashboard content');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to logout');
    }
  };

  const handleQuickAction = (action: string) => {
    try {
      switch (action) {
        case 'view-schedule':
          navigate('/maintenance/schedule');
          break;
        case 'update-spare-parts':
          navigate('/maintenance/spare-parts');
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error handling quick action:', error);
      toast.error('Failed to perform action');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Debug info */}
      <div className="fixed top-0 right-0 p-2 bg-black/50 text-white text-xs z-50">
        Debug: Component rendered
      </div>

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
              <p className="font-semibold text-blue-900">{user?.name || user?.username || user?.email || "Maintenance User"}</p>
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
                <span className="text-2xl font-extrabold text-blue-800 tracking-tight">Maintenance Dashboard</span>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-blue-100 relative transition-colors">
                  <BellIcon className="h-6 w-6 text-blue-600" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-full text-xs text-white flex items-center justify-center shadow-md">
                    {workOrders.filter(wo => wo.status === 'pending').length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleQuickAction('view-schedule')}
                className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-100"
              >
                <CalendarIcon className="h-6 w-6 text-blue-600" />
                <span className="font-medium text-blue-900">View Schedule</span>
              </button>
              <button
                onClick={() => handleQuickAction('update-spare-parts')}
                className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-100"
              >
                <CogIcon className="h-6 w-6 text-blue-600" />
                <span className="font-medium text-blue-900">Update Spare Parts</span>
              </button>
            </div>
          </div>

          {/* Work Orders Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Recent Work Orders</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {equipment.find(e => e.id === order.equipmentId)?.model || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.issue}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Maintenance Schedule Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Upcoming Maintenance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maintenanceSchedules.slice(0, 6).map((schedule) => (
                <div key={schedule.id} className="bg-white rounded-xl shadow-sm p-4 border border-blue-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-blue-900">{schedule.equipment.model}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                        schedule.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {schedule.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{schedule.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(schedule.scheduledDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spare Parts Section */}
          <div>
            <h2 className="text-xl font-bold text-blue-900 mb-4">Low Stock Spare Parts</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {spareParts
                      .filter(part => part.quantity <= part.minimumQuantity)
                      .slice(0, 5)
                      .map((part) => (
                        <tr key={part.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">{part.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.minimumQuantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.location}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaintenanceTechDashboard; 