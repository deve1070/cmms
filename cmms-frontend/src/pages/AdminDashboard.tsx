import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersApi, equipmentApi, workOrdersApi, reportsApi, budgetsApi, complianceApi, contractsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  UsersIcon,
  CubeIcon,
  WrenchIcon,
  ClockIcon,
  PlusIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalUsers: number;
  totalEquipment: number;
  activeWorkOrders: number;
  pendingMaintenance: number;
  totalBudget: number;
  spentBudget: number;
  complianceStatus: {
    compliant: number;
    nonCompliant: number;
    pending: number;
  };
  contracts: {
    active: number;
    expiring: number;
    total: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user' | 'equipment' | 'workOrder' | 'budget' | 'compliance' | 'contract';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEquipment: 0,
    activeWorkOrders: 0,
    pendingMaintenance: 0,
    totalBudget: 0,
    spentBudget: 0,
    complianceStatus: {
      compliant: 0,
      nonCompliant: 0,
      pending: 0,
    },
    contracts: {
      active: 0,
      expiring: 0,
      total: 0,
    },
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [users, equipment, workOrders, budgets, compliance, contractsData] = await Promise.all([
          usersApi.getAll(),
          equipmentApi.getAll(),
          workOrdersApi.getAll(),
          budgetsApi.getAll(),
          complianceApi.getAll(),
          contractsApi.getAll(),
        ]);

        // Calculate stats
        const activeWorkOrders = workOrders.filter(wo => 
          wo.status === 'In Progress' || 
          wo.status === 'Assigned' || 
          wo.status === 'On Hold'
        ).length;

        const pendingMaintenance = workOrders.filter(wo => 
          wo.status === 'Reported' || 
          wo.status === 'Open'
        ).length;

        const totalBudget = budgets.reduce((sum, b) => sum + b.allocated, 0);
        const spentBudget = budgets.reduce((sum, b) => sum + b.spent, 0);

        const complianceStatus = {
          compliant: compliance.filter(c => c.status === 'compliant').length,
          nonCompliant: compliance.filter(c => c.status === 'non-compliant').length,
          pending: compliance.filter(c => c.status === 'pending').length,
        };

        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const contractStats = {
          active: contractsData.filter(c => c.status === 'active').length,
          expiring: contractsData.filter(c => {
            const endDate = new Date(c.endDate);
            return endDate > now && endDate <= thirtyDaysFromNow;
          }).length,
          total: contractsData.length,
        };

        setStats({
          totalUsers: users.length,
          totalEquipment: equipment.length,
          activeWorkOrders,
          pendingMaintenance,
          totalBudget,
          spentBudget,
          complianceStatus,
          contracts: contractStats,
        });

        // Get recent activities
        const activities: RecentActivity[] = [];

        // Add user activities
        users.slice(0, 3).forEach(user => {
          activities.push({
            id: user.id,
            type: 'user',
            title: 'New User Registration',
            description: `${user.username} joined the system`,
            timestamp: user.createdAt,
          });
        });

        // Add work order activities
        workOrders.slice(0, 3).forEach(wo => {
          activities.push({
            id: wo.id,
            type: 'workOrder',
            title: 'Work Order Update',
            description: `${wo.type} work order for ${wo.equipment.model}`,
            timestamp: wo.updatedAt,
            status: wo.status,
          });
        });

        // Add budget activities
        budgets.slice(0, 3).forEach(budget => {
          activities.push({
            id: budget.id,
            type: 'budget',
            title: 'Budget Update',
            description: `${budget.category} budget for ${budget.department}`,
            timestamp: budget.lastUpdated,
            status: budget.status,
          });
        });

        // Add compliance activities
        compliance.slice(0, 3).forEach(req => {
          activities.push({
            id: req.id,
            type: 'compliance',
            title: 'Compliance Update',
            description: `${req.title} - ${req.status}`,
            timestamp: req.lastChecked,
            status: req.status,
          });
        });

        // Add contract activities
        contractsData.slice(0, 3).forEach(contract => {
          activities.push({
            id: contract.id,
            type: 'contract',
            title: 'Contract Update',
            description: `${contract.title} - ${contract.status}`,
            timestamp: contract.endDate,
            status: contract.status,
          });
        });

        // Sort activities by timestamp
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivities(activities.slice(0, 5));

      } catch (error) {
        toast.error('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-user':
        navigate('/admin/users/new');
        break;
      case 'add-equipment':
        navigate('/admin/equipment/new');
        break;
      case 'create-work-order':
        navigate('/admin/work-orders/new');
        break;
      case 'manage-budgets':
        navigate('/admin/budgets');
        break;
      case 'manage-compliance':
        navigate('/admin/compliance');
        break;
      case 'manage-contracts':
        navigate('/admin/contracts');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.username}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Work Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeWorkOrders}</p>
            </div>
            <WrenchIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingMaintenance}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Budget Overview</h3>
            <CurrencyDollarIcon className="h-8 w-8 text-indigo-500" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold text-indigo-600">${stats.totalBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Spent</p>
              <p className="text-2xl font-bold text-indigo-600">${stats.spentBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Utilization Rate</p>
              <p className="text-2xl font-bold text-indigo-600">
                {((stats.spentBudget / stats.totalBudget) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Compliance Status</h3>
            <ShieldCheckIcon className="h-8 w-8 text-green-500" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Compliant</p>
              <p className="text-2xl font-bold text-green-600">{stats.complianceStatus.compliant}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Non-Compliant</p>
              <p className="text-2xl font-bold text-red-600">{stats.complianceStatus.nonCompliant}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.complianceStatus.pending}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Contract Overview</h3>
            <DocumentIcon className="h-8 w-8 text-blue-500" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Active Contracts</p>
              <p className="text-2xl font-bold text-blue-600">{stats.contracts.active}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.contracts.expiring}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Contracts</p>
              <p className="text-2xl font-bold text-blue-600">{stats.contracts.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Quick Actions</h3>
            <PlusIcon className="h-8 w-8 text-gray-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleQuickAction('add-user')}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-blue-600"
            >
              <UsersIcon className="h-6 w-6" />
              <span>Add User</span>
            </button>
            <button
              onClick={() => handleQuickAction('add-equipment')}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-green-600"
            >
              <CubeIcon className="h-6 w-6" />
              <span>Add Equipment</span>
            </button>
            <button
              onClick={() => handleQuickAction('create-work-order')}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-yellow-600"
            >
              <WrenchIcon className="h-6 w-6" />
              <span>Create Work Order</span>
            </button>
            <button
              onClick={() => handleQuickAction('manage-budgets')}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-indigo-600"
            >
              <CurrencyDollarIcon className="h-6 w-6" />
              <span>Manage Budgets</span>
            </button>
            <button
              onClick={() => handleQuickAction('manage-compliance')}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-red-600"
            >
              <ShieldCheckIcon className="h-6 w-6" />
              <span>Manage Compliance</span>
            </button>
            <button
              onClick={() => handleQuickAction('manage-contracts')}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-blue-600"
            >
              <DocumentIcon className="h-6 w-6" />
              <span>Manage Contracts</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Recent Activities</h3>
          <DocumentTextIcon className="h-8 w-8 text-gray-500" />
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {activity.type === 'user' && <UsersIcon className="h-6 w-6 text-blue-500" />}
                {activity.type === 'equipment' && <CubeIcon className="h-6 w-6 text-green-500" />}
                {activity.type === 'workOrder' && <WrenchIcon className="h-6 w-6 text-yellow-500" />}
                {activity.type === 'budget' && <CurrencyDollarIcon className="h-6 w-6 text-indigo-500" />}
                {activity.type === 'compliance' && <ShieldCheckIcon className="h-6 w-6 text-red-500" />}
                {activity.type === 'contract' && <DocumentIcon className="h-6 w-6 text-blue-500" />}
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {activity.status && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    activity.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;