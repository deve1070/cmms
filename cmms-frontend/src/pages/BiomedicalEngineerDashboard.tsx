import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi, workOrdersApi } from '../services/api';
import { toast } from 'react-hot-toast';
import BiomedicalLayout from '../components/BiomedicalLayout';
import type { Equipment } from '../types';
import type { WorkOrder } from '../types/workOrder';
import { getUserDisplayName } from '../types/auth';

const BiomedicalEngineerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEquipment: 0,
    pendingWorkOrders: 0,
    completedWorkOrders: 0,
    criticalIssues: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [equipment, workOrders] = await Promise.all([
          equipmentApi.getAll(),
          workOrdersApi.getAll(),
        ]);

        setStats({
          totalEquipment: equipment.length,
          pendingWorkOrders: workOrders.filter((wo) => wo.status === 'pending').length,
          completedWorkOrders: workOrders.filter((wo) => wo.status === 'completed').length,
          criticalIssues: workOrders.filter(
            (wo) => wo.priority === 'high' && wo.status !== 'completed'
          ).length,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role.toLowerCase() === 'biomedical_engineer') {
      fetchStats();
    }
  }, [user]);

  return (
    <BiomedicalLayout
      title="Biomedical Engineer Dashboard"
      userDisplayName={getUserDisplayName(user, 'Biomedical Engineer')}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 px-4 sm:px-6 lg:px-8 py-6"
        >
          <p className="text-sm text-gray-600">
            Welcome, {getUserDisplayName(user, 'Biomedical Engineer')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Total Equipment</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalEquipment}</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Pending Work Orders</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingWorkOrders}</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Completed Work Orders</h3>
              <p className="text-2xl font-bold text-green-600">{stats.completedWorkOrders}</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Critical Issues</h3>
              <p className="text-2xl font-bold text-red-600">{stats.criticalIssues}</p>
            </div>
          </div>
        </motion.div>
      )}
    </BiomedicalLayout>
  );
};

export default BiomedicalEngineerDashboard;