import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi, workOrdersApi, maintenanceApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  BarChart3,
  Wrench,
  FileText,
  Bell,
  Package,
  AlertTriangle,
  Plus,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react';
import type { Equipment } from '../types/equipment';
import type { WorkOrder } from '../types/workOrder';
import type { MaintenanceReport } from '../types/maintenance';

const BiomedicalEngineerDashboard: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { user } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [equipmentData, workOrdersData, reportsData] = await Promise.all([
        equipmentApi.getAll(),
        workOrdersApi.getAll(),
        maintenanceApi.getAll({}),
      ]);

      setEquipment(equipmentData);
      setWorkOrders(workOrdersData);
      setMaintenanceReports(reportsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard data refreshed');
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (item.location?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = (wo.issue?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (wo.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (equipmentId: string, newStatus: Equipment['status']) => {
    try {
      await equipmentApi.update(equipmentId, { status: newStatus });
      setEquipment(prev => prev.map(item => 
        item.id === equipmentId ? { ...item, status: newStatus } : item
      ));
      toast.success('Equipment status updated');
    } catch (err) {
      toast.error('Failed to update equipment status');
    }
  };

  const handleWorkOrderStatusChange = async (workOrderId: string, newStatus: WorkOrder['status']) => {
    try {
      await workOrdersApi.update(workOrderId, { status: newStatus });
      setWorkOrders(prev => prev.map(wo => 
        wo.id === workOrderId ? { ...wo, status: newStatus } : wo
      ));
      toast.success('Work order status updated');
    } catch (err) {
      toast.error('Failed to update work order status');
    }
  };

  const handleReportStatusChange = async (reportId: string, newStatus: MaintenanceReport['status']) => {
    try {
      await maintenanceApi.update(reportId, { status: newStatus });
      setMaintenanceReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ));
      toast.success('Maintenance report status updated');
    } catch (err) {
      toast.error('Failed to update maintenance report status');
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
        >
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Dashboard Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search equipment or work orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Operational">Operational</option>
                <option value="Needs Maintenance">Needs Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh</span>
            </button>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Equipment Status',
                  value: `${Math.round(
                    (equipment.filter((e) => e.status === 'Operational').length / equipment.length) * 100,
                  )}%`,
                  icon: Package,
                  color: 'text-green-600',
                },
                {
                  label: 'Active Work Orders',
                  value: workOrders.filter((wo) => wo.status !== 'Completed' && wo.status !== 'Cancelled').length,
                  icon: Wrench,
                  color: 'text-blue-600',
                },
                {
                  label: 'Pending Reports',
                  value: maintenanceReports.filter((report) => report.status === 'Scheduled').length,
                  icon: FileText,
                  color: 'text-yellow-600',
                },
                {
                  label: 'My Open Issues',
                  value: workOrders.filter(
                    (wo) =>
                      wo.reportedById === user?.id &&
                      wo.status !== 'Completed' &&
                      wo.status !== 'Cancelled',
                  ).length,
                  icon: AlertTriangle,
                  color: 'text-purple-600',
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-700">{stat.label}</h3>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  label: 'Create Work Order',
                  icon: Plus,
                  path: '/biomedical/work-orders/new',
                  description: 'Create a new maintenance work order',
                  bgColor: 'bg-blue-100',
                  textColor: 'text-blue-600',
                },
                {
                  label: 'View Equipment',
                  icon: Package,
                  path: '/biomedical/equipment',
                  description: 'Check equipment status and details',
                  bgColor: 'bg-green-100',
                  textColor: 'text-green-600',
                },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`h-6 w-6 ${action.textColor}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800">{action.label}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Work Orders</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workOrders.slice(0, 5).map((wo) => (
                      <tr key={wo.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{wo.equipment.name}</div>
                          <div className="text-sm text-gray-500">{wo.equipment.location}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{wo.issue}</div>
                          <div className="text-sm text-gray-500">{wo.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            wo.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            wo.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            wo.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {wo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            wo.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            wo.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            wo.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {wo.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(wo.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/biomedical/work-orders/${wo.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Maintenance Reports</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="Preventive">Preventive</option>
                      <option value="Corrective">Corrective</option>
                      <option value="Calibration">Calibration</option>
                      <option value="Inspection">Inspection</option>
                    </select>
                  </div>
                  <Link
                    to="/biomedical/reports/new"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>New Report</span>
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {maintenanceReports
                      .filter(report => {
                        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
                        const matchesType = typeFilter === 'all' || report.type === typeFilter;
                        return matchesStatus && matchesType;
                      })
                      .slice(0, 5)
                      .map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{report.equipment.name}</div>
                            <div className="text-sm text-gray-500">{report.equipment.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              report.type === 'Preventive' ? 'bg-green-100 text-green-800' :
                              report.type === 'Corrective' ? 'bg-red-100 text-red-800' :
                              report.type === 'Calibration' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              report.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              report.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              report.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.performedBy.username}</div>
                            <div className="text-sm text-gray-500">{report.performedBy.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              to={`/biomedical/reports/${report.id}`}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              View
                            </Link>
                            {report.status === 'Scheduled' && (
                              <button
                                onClick={() => handleReportStatusChange(report.id, 'In Progress')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Start
                              </button>
                            )}
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </motion.div>
      )}
    </>
  );
};

export default BiomedicalEngineerDashboard;