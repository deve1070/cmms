import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersApi, equipmentApi, workOrdersApi, reportsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  UsersIcon,
  CubeIcon,
  WrenchIcon,
  ClockIcon,
  PlusIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalUsers: number;
  totalEquipment: number;
  activeWorkOrders: number;
  pendingMaintenance: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'equipment' | 'repair' | 'alert';
  action: string;
  details?: string;
  time: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEquipment: 0,
    activeWorkOrders: 0,
    pendingMaintenance: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [users, equipment, workOrders] = await Promise.all([
          usersApi.getAll(),
          equipmentApi.getAll(),
          workOrdersApi.getAll(),
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

        setStats({
          totalUsers: users.length,
          totalEquipment: equipment.length,
          activeWorkOrders,
          pendingMaintenance,
        });

        // Get recent activities
        const activities: RecentActivity[] = [];

        // Add recent user registrations
        const recentUsers = users
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 2);
        
        recentUsers.forEach(user => {
          activities.push({
            id: user.id,
            type: 'user',
            action: 'New user registered',
            details: `${user.username} joined as ${user.role}`,
            time: new Date(user.createdAt).toLocaleDateString(),
            icon: UsersIcon,
            color: 'text-blue-500',
          });
        });

        // Add recent work orders
        const recentWorkOrders = workOrders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 2);

        recentWorkOrders.forEach(wo => {
          activities.push({
            id: wo.id,
            type: wo.status === 'Completed' ? 'repair' : 'equipment',
            action: wo.status === 'Completed' ? 'Repair request completed' : 'Equipment maintenance required',
            details: wo.issue,
            time: new Date(wo.createdAt).toLocaleDateString(),
            icon: wo.status === 'Completed' ? CheckCircleIcon : WrenchIcon,
            color: wo.status === 'Completed' ? 'text-green-500' : 'text-yellow-500',
          });
        });

        // Sort activities by date
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role.toLowerCase() === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'add-user':
          navigate('/admin/users/new');
          break;
        case 'add-equipment':
          navigate('/admin/equipment/new');
          break;
        case 'new-maintenance':
          navigate('/admin/maintenance-schedule/new');
          break;
        case 'generate-report':
          // Generate a performance report for the current month
          const startDate = new Date();
          startDate.setDate(1); // First day of current month
          const endDate = new Date();
          
          const report = await reportsApi.create({
            type: 'performance',
            title: `Performance Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
            content: 'Monthly performance report',
            period: 'monthly',
            metrics: {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            }
          }) as { id: string };
          
          toast.success('Report generated successfully');
          navigate(`/admin/maintenance-reports/${report.id}`);
          break;
      }
    } catch (error) {
      console.error('Error performing quick action:', error);
      toast.error('Failed to perform action');
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => handleQuickAction('add-user')}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-blue-600"
              >
                <PlusIcon className="h-6 w-6" />
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
                onClick={() => handleQuickAction('new-maintenance')}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-yellow-600"
              >
                <WrenchIcon className="h-6 w-6" />
                <span>New Maintenance</span>
              </button>
              <button
                onClick={() => handleQuickAction('generate-report')}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-purple-600"
              >
                <DocumentTextIcon className="h-6 w-6" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                <UsersIcon className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Total Equipment</h3>
                <CubeIcon className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-4xl font-bold text-green-600">{stats.totalEquipment}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Active Work Orders</h3>
                <WrenchIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-4xl font-bold text-yellow-600">{stats.activeWorkOrders}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Pending Maintenance</h3>
                <ClockIcon className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-4xl font-bold text-red-600">{stats.pendingMaintenance}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50">
                    <div className={`p-2 rounded-lg ${activity.color} bg-opacity-10`}>
                      <activity.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;