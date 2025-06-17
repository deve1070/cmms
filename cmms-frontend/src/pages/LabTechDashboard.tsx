import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi, workOrdersApi, maintenanceApi, issueReportsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Beaker,
  FileText,
  Bell,
  Wrench,
  Settings,
  LogOut,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import type { Equipment } from '../types/equipment';
import type { WorkOrder } from '../types/workOrder';
import type { MaintenanceReport } from '../types/maintenance';
import type { IssueReport } from '../types/issueReport';
import { Role } from '../config/permissions';
import type { CreateIssueReportDto } from '../types/issueReport';

interface NewReport {
  issue: string;
  priority: 'Low' | 'Medium' | 'High';
  description: string;
}

const LabTechDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>([]);
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [newReport, setNewReport] = useState<NewReport>({
    issue: '',
    priority: 'Medium',
    description: ''
  });
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [equipmentUpdate, setEquipmentUpdate] = useState({
    status: '',
    notes: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== Role.LAB_TECHNICIAN) {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [equipmentData, workOrdersData, reportsData, issuesData] = await Promise.all([
          equipmentApi.getAll(),
          workOrdersApi.getAll(),
          maintenanceApi.getAll({}),
          issueReportsApi.getAll()
        ]);

        setEquipment(equipmentData);
        setWorkOrders(workOrdersData);
        setMaintenanceReports(reportsData);
        setIssueReports(issuesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching dashboard data:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'report-issue':
        setReportDialogOpen(true);
        break;
      case 'view-equipment':
        navigate('/lab/equipment');
        break;
      default:
        break;
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('Your session has expired. Please log in again.');
      return;
    }

    if (!selectedEquipment) {
      toast.error('Please select equipment');
      return;
    }

    if (!newReport.issue.trim()) {
      toast.error('Please provide an issue description');
      return;
    }

    if (!newReport.description.trim()) {
      toast.error('Please provide a detailed description');
        return;
      }

    try {
      const reportData = {
        equipmentId: selectedEquipment.id,
        issue: newReport.issue.trim(),
        priority: newReport.priority,
        description: newReport.description.trim(),
        status: 'Pending' as const,
        reportedById: user.id
      };

      console.log('Submitting report:', reportData);
      const response = await issueReportsApi.create(reportData);
      console.log('Report submitted successfully:', response);

      // Update the local state with the new report
      setIssueReports(prev => [response, ...prev]);
      
      // Reset form
      setSelectedEquipment(null);
      setNewReport({ issue: '', priority: 'Medium', description: '' });
      setReportDialogOpen(false);

      // Show success message
      toast.success('Issue report submitted successfully');
    } catch (error: any) {
      console.error('Error submitting report:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Let the API interceptor handle auth errors
        return;
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
    }
  };

  const handleUpdateSubmit = async () => {
    if (!selectedEquipment) return;

    try {
      await equipmentApi.update(selectedEquipment.id, {
        status: equipmentUpdate.status,
        notes: equipmentUpdate.notes
      });

      toast.success('Equipment updated successfully');
      setUpdateDialogOpen(false);
      setEquipmentUpdate({ status: '', notes: '' });
      setSelectedEquipment(null);
    } catch (err) {
      console.error('Error updating equipment:', err);
      toast.error('Failed to update equipment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'out of service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
  return (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
    );
  }

  if (error) {
    return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
        >
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </motion.div>
    );
  }

  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 px-4 sm:px-6 lg:px-8 py-6"
        >
          <p className="text-sm text-gray-600">
            Welcome, {user?.username || 'Lab Technician'}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  label: 'Report Equipment Issue',
                  icon: Plus,
                  action: 'report-issue',
                  description: 'Report an equipment issue for review',
                  bgColor: 'bg-blue-100',
                  textColor: 'text-blue-600',
                },
                {
                  label: 'View Equipment',
                  icon: Beaker,
                  action: 'view-equipment',
                  description: 'Check equipment status and details',
                  bgColor: 'bg-green-100',
                  textColor: 'text-green-600',
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.action)}
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
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Equipment Status</h2>
                <Link to="/lab/equipment" className="text-blue-600 hover:underline text-sm">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {equipment.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.location}</p>
                      </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                  </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent Maintenance Reports</h2>
                <Link to="/lab/reports" className="text-blue-600 hover:underline text-sm">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {maintenanceReports.slice(0, 5).map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-800">{report.equipment.name}</h3>
                        <p className="text-sm text-gray-500">{report.description}</p>
                      </div>
                      <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      report.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : report.status === 'In Progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">My Issue Reports</h2>
                <Link to="/lab/issues" className="text-blue-600 hover:underline text-sm">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {issueReports
                  .filter(report => report.reportedById === user?.id)
                  .slice(0, 5)
                  .map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{report.issue}</h3>
                          <p className="text-sm text-gray-500">Equipment: {report.equipment.name}</p>
                          <p className="text-sm text-gray-500">Status: {report.status}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm ${
                          report.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          report.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          report.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>

      {/* Report Issue Dialog */}
      {reportDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Report Equipment Issue</h3>
              <button
                onClick={() => setReportDialogOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
              <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedEquipment?.id || ''}
                  onChange={(e) => {
                    const selectedEq = equipment.find((eq: Equipment) => eq.id === e.target.value);
                      setSelectedEquipment(selectedEq || null);
                    }}
                  required
                >
                  <option value="">Select Equipment</option>
                  {equipment.map((item: Equipment) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.location}
                    </option>
                      ))}
                </select>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newReport.issue}
                  onChange={(e) => setNewReport({ ...newReport, issue: e.target.value })}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newReport.priority}
                  onChange={(e) => setNewReport({ ...newReport, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  placeholder="Please provide a detailed description of the issue, including any relevant symptoms or observations"
                    rows={4}
                    required
                  />
                </div>
              </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setReportDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                  Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                  Submit Report
              </button>
            </div>
          </div>
      </div>
      )}

      {/* Update Equipment Dialog */}
      {updateDialogOpen && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Update Equipment Status</h3>
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                value={equipmentUpdate.status}
                  onChange={(e) => setEquipmentUpdate({ ...equipmentUpdate, status: e.target.value })}
              >
                  <option value="">Select Status</option>
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full p-2 border rounded-lg"
                value={equipmentUpdate.notes}
                  onChange={(e) => setEquipmentUpdate({ ...equipmentUpdate, notes: e.target.value })}
                placeholder="Add any relevant notes"
                  rows={4}
              />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setUpdateDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LabTechDashboard;