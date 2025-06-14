import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi, workOrdersApi, maintenanceApi, issueReportsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Wrench,
  FileText,
  Bell,
  Package,
  AlertTriangle,
  Plus,
  Beaker,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Settings
} from 'lucide-react';
import SharedLayout from '../components/SharedLayout';
import type { Equipment } from '../types/equipment';
import type { WorkOrder } from '../types/workOrder';
import type { MaintenanceReport } from '../types/maintenance';
import type { IssueReport, CreateIssueReportDto } from '../types/issueReport';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Role } from '../config/permissions';

type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

interface NewReport {
  issue: string;
  priority: Priority;
  description: string;
}

const sidebar = (
  <nav className="flex flex-col space-y-1 p-4">
    {[
      { name: 'Equipment', icon: Beaker, path: '/lab/equipment' },
      { name: 'Maintenance', icon: Wrench, path: '/lab/maintenance' },
      { name: 'Reports', icon: FileText, path: '/lab/reports' },
      { name: 'Notifications', icon: Bell, path: '/lab/notifications' },
    ].map((item) => (
      <Link
        key={item.name}
        to={item.path}
        className="flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
      >
        <item.icon className="h-5 w-5" />
        <span>{item.name}</span>
      </Link>
    ))}
  </nav>
);

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

  const handleReportIssue = async () => {
    if (!selectedEquipment) {
      toast.error('Please select equipment first');
      return;
    }

    if (!newReport.issue.trim()) {
      toast.error('Please provide an issue description');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      console.log('Submitting issue report:', {
        equipmentId: selectedEquipment.id,
        issue: newReport.issue,
        priority: newReport.priority,
        description: newReport.description
      });

      const response = await fetch('http://localhost:3002/api/issue-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          equipmentId: selectedEquipment.id,
          issue: newReport.issue,
          priority: newReport.priority,
          description: newReport.description
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create issue report');
      }

      setIssueReports((prev) => [...prev, data]);
      toast.success('Issue reported successfully. A biomedical engineer will review your report.');
      setReportDialogOpen(false);
      setNewReport({ issue: '', priority: 'Medium', description: '' });
      setSelectedEquipment(null);
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to report issue');
    }
  };

  const handleUpdateEquipment = async () => {
    if (!selectedEquipment) return;

    try {
      const updatedEquipment = await equipmentApi.update(selectedEquipment.id, {
        ...selectedEquipment,
        status: equipmentUpdate.status as Equipment['status'],
        lastMaintenance: new Date().toISOString()
      }) as Equipment;

      setEquipment(prev => prev.map(eq => 
        eq.id === updatedEquipment.id ? updatedEquipment : eq
      ));
      toast.success('Equipment status updated successfully');
      setUpdateDialogOpen(false);
      setEquipmentUpdate({ status: '', notes: '' });
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Failed to update equipment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800';
      case 'Needs Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== Role.LAB_TECHNICIAN) {
    return null;
  }

  return (
    <SharedLayout title="Laboratory Technician Dashboard" sidebar={sidebar}>
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
            onClick={() => window.location.reload()}
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
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
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
                        className={`px-3 py-1 rounded-full text-sm font-medium ${report.status === 'Completed'
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
        </motion.div>
      )}

      {/* Report Issue Dialog */}
      <div className="flex items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Report Equipment Issue</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Report Equipment Issue</DialogTitle>
              <DialogDescription>
                Fill out the form below to report an equipment issue. A biomedical engineer will review your report.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleReportIssue();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Equipment</label>
                  <Select
                    value={selectedEquipment?.id}
                    onValueChange={(value) => {
                      const selectedEq = equipment.find((eq) => eq.id === value);
                      setSelectedEquipment(selectedEq || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.name} - {eq.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Issue</label>
                  <Input
                    value={newReport.issue}
                    onChange={(e) => setNewReport(prev => ({ ...prev, issue: e.target.value }))}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newReport.priority}
                    onValueChange={(value) => setNewReport(prev => ({ ...prev, priority: value as Priority }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the issue"
                    rows={4}
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" type="button" onClick={() => setReportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Report
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Equipment Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={equipmentUpdate.status}
                onValueChange={(value) => setEquipmentUpdate(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Out of Service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={equipmentUpdate.notes}
                onChange={(e) => setEquipmentUpdate(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any relevant notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEquipment}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SharedLayout>
  );
};

export default LabTechDashboard;