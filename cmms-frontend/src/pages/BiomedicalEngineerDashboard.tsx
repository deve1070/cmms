import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi, workOrdersApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { Equipment } from '../types/equipment';
import type { WorkOrder } from '../types/workOrder';

const BiomedicalEngineerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEquipment: 0,
    pendingWorkOrders: 0,
    completedWorkOrders: 0,
    criticalIssues: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [equipment, workOrders] = await Promise.all([
          equipmentApi.getAll(),
          workOrdersApi.getAll(),
        ]) as [Equipment[], WorkOrder[]];

        const pendingWorkOrders = workOrders.filter((wo: WorkOrder) => wo.status === 'pending');
        const completedWorkOrders = workOrders.filter((wo: WorkOrder) => wo.status === 'completed');
        const criticalIssues = workOrders.filter((wo: WorkOrder) => wo.priority === 'high' && wo.status !== 'completed');

        setStats({
          totalEquipment: equipment.length,
          pendingWorkOrders: pendingWorkOrders.length,
          completedWorkOrders: completedWorkOrders.length,
          criticalIssues: criticalIssues.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Biomedical Engineer Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {user?.name || 'Biomedical Engineer'}
          </p>

          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Equipment */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Equipment</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalEquipment}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/biomedical/equipment" className="font-medium text-blue-600 hover:text-blue-500">
                    View all equipment
                  </Link>
                </div>
              </div>
            </div>

            {/* Pending Work Orders */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Work Orders</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingWorkOrders}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/biomedical/work-orders" className="font-medium text-blue-600 hover:text-blue-500">
                    View all work orders
                  </Link>
                </div>
              </div>
            </div>

            {/* Completed Work Orders */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed Work Orders</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.completedWorkOrders}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/biomedical/reports" className="font-medium text-blue-600 hover:text-blue-500">
                    View reports
                  </Link>
                </div>
              </div>
            </div>

            {/* Critical Issues */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Critical Issues</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.criticalIssues}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/biomedical/work-orders" className="font-medium text-blue-600 hover:text-blue-500">
                    View critical issues
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/biomedical/work-orders/new"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">Create New Work Order</span>
              </Link>

              <Link
                to="/biomedical/equipment"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">View Equipment List</span>
              </Link>

              <Link
                to="/biomedical/reports"
                className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">View Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiomedicalEngineerDashboard; 