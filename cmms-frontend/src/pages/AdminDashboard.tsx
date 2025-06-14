import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersApi, equipmentApi, workOrdersApi } from '../services/api';
import AdminLayout from '../components/AdminLayout';
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

        setStats({
          totalUsers: users.length,
          totalEquipment: equipment.length,
          activeWorkOrders: workOrders.filter(wo => wo.status === 'In Progress').length,
          pendingMaintenance: workOrders.filter(wo => wo.status === 'Reported').length,
        });

        const activities: RecentActivity[] = [
          ...users.slice(0, 2).map(user => ({
            id: user.id,
            type: 'user' as const,
            action: 'New user registered',
            details: `${user.name || user.username} joined as ${user.role}`,
            time: 'Recently',
            icon: UsersIcon,
            color: 'text-blue-500',
          })),
          ...workOrders.slice(0, 2).map(wo => ({
            id: wo.id,
            type: wo.status === 'Completed' ? 'repair' as const : 'equipment' as const,
            action: wo.status === 'Completed' ? 'Repair request completed' : 'Equipment maintenance required',
            details: wo.issue,
            time: 'Recently',
            icon: wo.status === 'Completed' ? CheckCircleIcon : WrenchIcon,
            color: wo.status === 'Completed' ? 'text-green-500' : 'text-yellow-500',
          })),
        ];

        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role.toLowerCase() === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-user':
        navigate('/admin/users/new');
        break;
      case 'add-equipment':
        navigate('/admin/equipment/new');
        break;
      case 'new-maintenance':
        navigate('/admin/maintenance/new');
        break;
      case 'generate-report':
        navigate('/admin/reports/new');
        break;
    }
  };

  return (
    <AdminLayout title="Admin Dashboard">
      <main className="p-6">
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
                {recentActivities.map((activity) => (
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
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminDashboard;