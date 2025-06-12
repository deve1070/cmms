import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi, workOrdersApi, maintenanceApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  BeakerIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

interface SidebarItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

interface Equipment {
  id: string;
  inventoryNumber: string;
  manufacturerName: string;
  modelNumber: string;
  manufacturerServiceNumber: string;
  vendorName: string;
  vendorCode: string;
  locationDescription: string;
  locationCode: string;
  purchasePrice: number;
  installationDate: string;
  warrantyExpirationDate: string;
  status: string;
  category: string;
  department: string;
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

interface MaintenanceReport {
  id: string;
  equipmentId: string;
  type: 'preventive' | 'corrective';
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
  date: string;
  equipment: {
    model: string;
    serialNumber: string;
    location: string;
  };
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', icon: ChartBarIcon, path: '/lab/dashboard' },
  { name: 'Report Issue', icon: ExclamationTriangleIcon, path: '/lab/report-issue' },
  { name: 'Equipment Status', icon: BeakerIcon, path: '/lab/equipment' },
  { name: 'My Reported Issues', icon: ClipboardDocumentCheckIcon, path: '/lab/reports' }, // Changed name
];

const LabTechDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [equipmentData, workOrdersData, reportsData] = await Promise.all([
          equipmentApi.getAll(),
          workOrdersApi.getAll(),
          maintenanceApi.getAll({}),
        ]) as [Equipment[], WorkOrder[], MaintenanceReport[]];

        setEquipment(equipmentData);
        setWorkOrders(workOrdersData);
        setMaintenanceReports(reportsData);
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'report-issue':
        navigate('/lab/report-issue');
        break;
      case 'view-equipment':
        navigate('/lab/equipment');
        break;
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
              <BeakerIcon className="h-8 w-8 text-blue-600 drop-shadow" />
              <h2 className="text-2xl font-extrabold text-blue-800 tracking-tight">Laboratory</h2>
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
              <p className="font-semibold text-blue-900">{user?.username || "Lab User"}</p>
              <p className="text-xs text-blue-500">Laboratory Technician</p>
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
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                aria-label="Open sidebar"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                <BellIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Dashboard Stats */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-blue-900 mb-6">My Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                    <h3 className="text-sm font-medium text-gray-500">Equipment In My Department</h3>
                    {/* TODO: Filter equipment based on Lab Tech's department/location, or fetch department-specific equipment. */}
                    <p className="mt-1 text-3xl font-semibold text-blue-900">N/A</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                    <h3 className="text-sm font-medium text-gray-500">My Open Reported Issues</h3>
                    <p className="mt-1 text-3xl font-semibold text-blue-900">
                      {
                        workOrders.filter(
                          (wo) =>
                            wo.reportedBy === user?.username && // Or user?.id if that's what reportedBy stores
                            wo.status !== 'completed' &&
                            wo.status !== 'cancelled'
                        ).length
                      }
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                    <h3 className="text-sm font-medium text-gray-500">Recently Serviced Equipment (My Dept)</h3>
                    {/* TODO: Implement logic to count equipment in user's dept with recent 'completed' maintenance. */}
                    <p className="mt-1 text-3xl font-semibold text-blue-900">N/A</p>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <button
                  onClick={() => handleQuickAction('report-issue')}
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Report Issue</h3>
                      <p className="text-sm text-blue-600">Report equipment failure or problem</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickAction('view-equipment')}
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <BeakerIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Equipment Status</h3>
                      <p className="text-sm text-blue-600">View equipment status and maintenance</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Equipment Status Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-blue-900">Equipment Status</h2>
                  <button
                    onClick={() => navigate('/lab/equipment')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {equipment.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-blue-900">{item.manufacturerName} {item.modelNumber}</h3>
                          <p className="text-sm text-blue-600">Inventory #: {item.inventoryNumber}</p>
                          <p className="text-sm text-blue-600">Location: {item.locationDescription} ({item.locationCode})</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === 'Operational' ? 'bg-green-100 text-green-800' :
                          item.status === 'Needs Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-blue-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>Installed: {new Date(item.installationDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>Warranty: {new Date(item.warrantyExpirationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Maintenance Reports */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-blue-900">Recent Maintenance Reports</h2>
                  <button
                    onClick={() => navigate('/lab/reports')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {maintenanceReports.slice(0, 5).map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-blue-900">{report.equipment.model}</h3>
                          <p className="text-sm text-blue-600">{report.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          report.status === 'completed' ? 'bg-green-100 text-green-800' :
                          report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status ? report.status.replace('_', ' ') : 'Unknown'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-blue-600">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>Date: {new Date(report.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabTechDashboard; 