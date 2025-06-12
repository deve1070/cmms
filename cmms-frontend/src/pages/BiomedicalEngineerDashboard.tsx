import React, { useState, useEffect } from 'react';
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
  UserGroupIcon,
  CurrencyDollarIcon,
  CubeIcon, // Added
  ClipboardDocumentListIcon, // Added
  WrenchScrewdriverIcon, // Added
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Assuming contractsApi exists or will be created in src/services/api.ts
import { equipmentApi, workOrdersApi, maintenanceApi, contractsApi } from '../services/api';
import { toast } from 'react-hot-toast';

// TODO: Move to a shared types file if used in multiple places
interface Equipment {
  id: string;
  serialNumber: string;
  manufacturerName: string;
  modelNumber: string;
  manufacturerServiceNumber?: string | null;
  vendorName?: string | null;
  vendorCode?: string | null;
  locationDescription: string;
  locationCode?: string | null;
  purchasePrice: number;
  installationDate: string;
  warrantyExpirationDate: string;
  status: 'Operational' | 'Needs Maintenance' | 'Out of Service' | 'Decommissioned';
  category: string;
  department: string;
  lastMaintenance?: string | null;
  createdAt?: string;
  updatedAt?: string;
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

// Added Contract interface (basic version)
interface Contract {
  id: string;
  vendor: string;
  equipmentId: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface SidebarItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Overview', icon: HomeIcon, path: '/biomedical/dashboard' },
  { name: 'Manage Equipment', icon: CubeIcon, path: '/biomedical/equipment' },
  { name: 'View Compliance', icon: CheckCircleIcon, path: '/biomedical/compliance' },
  { name: 'Work Orders', icon: DocumentTextIcon, path: '/biomedical/work-orders' },
  { name: 'Contracts', icon: ClipboardDocumentListIcon, path: '/biomedical/contracts' },
  { name: 'Spare Parts', icon: WrenchScrewdriverIcon, path: '/biomedical/spare-parts' },
  { name: 'Maintenance Reports', icon: ChartBarIcon, path: '/biomedical/reports' },
  // Settings removed
];

const BiomedicalEngineerDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearingWarrantyEndCount, setNearingWarrantyEndCount] = useState(0);
  const [pendingRenewalsCount, setPendingRenewalsCount] = useState(0);

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [equipmentData, workOrdersData, reportsData, contractsData] = await Promise.all([
          equipmentApi.getAll(),
          workOrdersApi.getAll(),
          maintenanceApi.getAll({}),
          contractsApi.getAll(),
        ]) as [Equipment[], WorkOrder[], MaintenanceReport[], Contract[]];

        setEquipment(equipmentData);
        setWorkOrders(workOrdersData);
        setMaintenanceReports(reportsData);
        setContracts(contractsData);

        // Calculate "Equipment Nearing Warranty End"
        const today = new Date();
        const warrantyThresholdDate = addDays(today, 60);
        const nearingWarranty = equipmentData.filter(e => {
          if (!e.warrantyExpirationDate) return false;
          const warrantyEndDate = new Date(e.warrantyExpirationDate);
          return warrantyEndDate >= today && warrantyEndDate <= warrantyThresholdDate;
        });
        setNearingWarrantyEndCount(nearingWarranty.length);

        // Calculate "Pending Contract Renewals"
        const contractRenewalThresholdDate = addDays(today, 60);
        const pendingRenewals = contractsData.filter(c => {
          if (!c.endDate) return false;
          const contractEndDate = new Date(c.endDate);
          return contractEndDate >= today && contractEndDate <= contractRenewalThresholdDate;
        });
        setPendingRenewalsCount(pendingRenewals.length);

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

  const handleAssign = async (workOrderId: string) => {
    try {
      // Implement work order assignment logic here
      toast.success('Work order assigned successfully');
    } catch (error) {
      console.error('Error assigning work order:', error);
      toast.error('Failed to assign work order');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
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
      </div>
    );
  }

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
                <h2 className="text-2xl font-bold text-gray-800">Biomedical Engineer</h2>
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
                <p className="font-medium text-gray-800">{user?.username || 'Biomedical Engineer'}</p>
                <p className="text-sm text-gray-500">Biomedical Engineer</p>
              </div>
            </div>
            <button
              onClick={async () => { await logout(); navigate('/login'); }}
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
              <h1 className="text-2xl font-bold text-gray-800">Biomedical Engineer Dashboard</h1>
            </div>
            <button className="p-2 relative hover:bg-gray-100 rounded-lg">
              <BellIcon className="h-6 w-6 text-gray-600" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {workOrders.filter(wo => wo.status === 'pending').length}
              </span>
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="p-6 space-y-8">
          {/* Quick Actions */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/biomedical/equipment/new')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center space-x-2"
              >
                <CubeIcon className="h-5 w-5" />
                <span>Add New Equipment</span>
              </button>
              <button
                onClick={() => navigate('/biomedical/work-orders/new')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center space-x-2"
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>Create Work Order</span>
              </button>
              <button
                onClick={() => navigate('/biomedical/spare-parts')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center space-x-2"
              >
                <WrenchScrewdriverIcon className="h-5 w-5" />
                <span>Manage Spare Parts</span>
              </button>
            </div>
          </section>

          {/* Dashboard Stats */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Total Equipment</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{equipment.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Open Work Orders</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {workOrders.filter(wo => wo.status === 'pending' || wo.status === 'in_progress').length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Equipment Nearing Warranty End</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{nearingWarrantyEndCount}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Pending Contract Renewals</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{pendingRenewalsCount}</p>
              </div>
            </div>
          </section>

          {/* Equipment Status */}
          <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Equipment Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.manufacturerName} {item.modelNumber}</h3>
                      <p className="text-sm text-gray-600">S/N: {item.serialNumber}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.status === 'Operational' ? 'bg-green-100 text-green-800' :
                      item.status === 'Needs Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Location: {item.locationDescription}</p>
                    <p>Last Maintenance: {new Date(item.lastMaintenance).toLocaleDateString()}</p>
                    <p>Next Maintenance: {new Date(item.nextMaintenance).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Work Orders */}
          <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Work Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reported By</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((wo) => {
                    const equipmentItem = equipment.find(e => e.id === wo.equipmentId);
                    const equipmentName = equipmentItem
                      ? `${equipmentItem.manufacturerName} ${equipmentItem.modelNumber} (S/N: ${equipmentItem.serialNumber})`
                      : `ID: ${wo.equipmentId}`;
                    return (
                      <tr key={wo.id} className="bg-gray-50 hover:bg-gray-100">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{equipmentName}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{wo.issue}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          wo.status === 'completed' ? 'bg-green-100 text-green-800' :
                          wo.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {wo.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2">{wo.reportedBy}</td>
                      <td className="px-4 py-2">{new Date(wo.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleAssign(wo.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Maintenance Reports */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Maintenance Reports</h2>
            <div className="space-y-4">
              {maintenanceReports.map((report) => (
                <div key={report.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{report.equipment.model}</h3>
                      <p className="text-sm text-gray-600">S/N: {report.equipment.serialNumber}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      report.status === 'completed' ? 'bg-green-100 text-green-800' :
                      report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default BiomedicalEngineerDashboard; 