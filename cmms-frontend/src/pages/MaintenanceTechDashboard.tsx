import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi, workOrdersApi, maintenanceApi, sparePartsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  BarChart3,
  Wrench,
  Calendar,
  Package2,
  ClipboardCheck,
  Bell,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight
} from 'lucide-react';
import SharedLayout from '../components/SharedLayout';
import type { Equipment } from '../types/equipment';
import type { WorkOrder } from '../types/workOrder';
import type { MaintenanceReport } from '../types/maintenance';
import type { SparePart } from '../types/sparePart';
import { getUserDisplayName } from '../types/auth';

const sidebar = (
  <nav className="flex flex-col space-y-1 p-4">
    {[
      { name: 'Dashboard', icon: BarChart3, path: '/maintenance/dashboard' },
      { name: 'My Work Orders', icon: Wrench, path: '/maintenance/work-orders' },
      { name: 'View Schedule', icon: Calendar, path: '/maintenance/schedule' },
      { name: 'Spare Parts Inventory', icon: Package2, path: '/maintenance/spare-parts' },
      { name: 'My Activity Log', icon: ClipboardCheck, path: '/maintenance/activity-log' },
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

interface MaintenanceReport {
  id: string;
  status: string;
  nextDueDate?: string;
  createdAt: string;
}

const MaintenanceTechDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pendingWorkOrders: 0,
    completedWorkOrders: 0,
    lowStockParts: 0,
    upcomingMaintenance: 0
  });
  const [recentWorkOrders, setRecentWorkOrders] = useState<WorkOrder[]>([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<MaintenanceReport[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch work orders
        const workOrders = await workOrdersApi.getAll();
        console.log('All work orders:', workOrders);
        
        // Filter work orders that are assigned to the current user or are in a state that can be picked up
        const myWorkOrders = workOrders.filter(wo => {
          console.log('Checking work order:', wo);
          console.log('Current user ID:', user?.id);
          return (
            wo.assignedToId === user?.id || // Already assigned to this user
            (wo.status === 'Assigned' && !wo.assignedToId) || // Assigned but not yet taken
            (wo.status === 'Open' && wo.type === 'Preventive') // Open preventive maintenance
          );
        });
        console.log('My work orders:', myWorkOrders);
        
        // Calculate stats
        const pendingWorkOrders = myWorkOrders.filter(wo => 
          wo.status === 'Assigned' || 
          wo.status === 'In Progress' || 
          wo.status === 'On Hold' ||
          wo.status === 'Open'
        ).length;
        
        const completedWorkOrders = myWorkOrders.filter(wo => 
          wo.status === 'Completed'
        ).length;
        
        // Fetch spare parts
        const spareParts = await sparePartsApi.getAll();
        const lowStockParts = spareParts.filter(part => 
          part.quantity <= part.minimumQuantity
        ).length;
        
        // Fetch maintenance schedule
        const maintenance = await maintenanceApi.getAll();
        const upcoming = maintenance
          .filter(m => 
            m.status === 'Scheduled' && 
            new Date(m.nextDueDate || m.createdAt) > new Date()
          )
          .sort((a, b) => 
            new Date(a.nextDueDate || a.createdAt).getTime() - 
            new Date(b.nextDueDate || b.createdAt).getTime()
          );

        setStats({
          pendingWorkOrders,
          completedWorkOrders,
          lowStockParts,
          upcomingMaintenance: upcoming.length
        });
        
        // Sort work orders by priority and due date
        const sortedWorkOrders = myWorkOrders
          .sort((a, b) => {
            // First sort by priority
            const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then sort by due date
            return new Date(a.completionDate || a.createdAt).getTime() - 
                   new Date(b.completionDate || b.createdAt).getTime();
          });
        
        console.log('Sorted work orders:', sortedWorkOrders);
        setRecentWorkOrders(sortedWorkOrders);
        setUpcomingMaintenance(upcoming.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const handleStartMaintenance = async (maintenanceId: string) => {
    try {
      await maintenanceApi.update(maintenanceId, {
        status: 'In Progress'
      });
      
      const maintenance: MaintenanceReport[] = await maintenanceApi.getAll();
      const upcoming = maintenance.filter(m => 
        m.status === 'Scheduled' && 
        new Date(m.nextDueDate || m.createdAt) > new Date()
      );
      
      setStats({
        pendingWorkOrders: stats.pendingWorkOrders,
        completedWorkOrders: stats.completedWorkOrders,
        upcomingMaintenance: upcoming.length
      });
      
      toast.success('Maintenance started successfully');
    } catch (err) {
      console.error('Error starting maintenance:', err);
      toast.error('Failed to start maintenance');
    }
  };

  if (loading) {
    return (
      <SharedLayout 
        title="Maintenance Technician Dashboard" 
        sidebar={sidebar}
        userDisplayName={getUserDisplayName(user, 'Maintenance Technician')}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </SharedLayout>
    );
  }

  if (error) {
    return (
      <SharedLayout 
        title="Maintenance Technician Dashboard" 
        sidebar={sidebar}
        userDisplayName={getUserDisplayName(user, 'Maintenance Technician')}
      >
        <div className="text-red-500 text-center p-4">{error}</div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout 
      title="Maintenance Technician Dashboard" 
      sidebar={sidebar}
      userDisplayName={getUserDisplayName(user, 'Maintenance Technician')}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Work Orders</p>
                <p className="text-2xl font-semibold">{stats.pendingWorkOrders}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Work Orders</p>
                <p className="text-2xl font-semibold">{stats.completedWorkOrders}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Parts</p>
                <p className="text-2xl font-semibold">{stats.lowStockParts}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Maintenance</p>
                <p className="text-2xl font-semibold">{stats.upcomingMaintenance}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Work Orders</h2>
              <Link 
                to="/maintenance/work-orders"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentWorkOrders && recentWorkOrders.length > 0 ? (
                recentWorkOrders.map((workOrder) => (
                  <div
                    key={workOrder.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/maintenance/work-orders/${workOrder.id}`)}
                  >
                    <div>
                      <p className="font-medium">{workOrder.issue}</p>
                      <p className="text-sm text-gray-600">{workOrder.equipment.name}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(workOrder.completionDate || workOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      workOrder.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      workOrder.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {workOrder.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No work orders assigned</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Upcoming Maintenance</h2>
              <Link 
                to="/maintenance/schedule"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Schedule
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingMaintenance.length > 0 ? (
                upcomingMaintenance.map((maintenance) => (
                  <div
                    key={maintenance.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{maintenance.equipment.name}</p>
                        <p className="text-sm text-gray-600">{maintenance.type} Maintenance</p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(maintenance.nextDueDate || maintenance.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        maintenance.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        maintenance.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {maintenance.status}
                      </span>
                    </div>
                    {maintenance.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {maintenance.description}
                      </p>
                    )}
                    <div className="mt-3 flex justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/maintenance/schedule/${maintenance.id}`)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                      {maintenance.status === 'Scheduled' && (
                        <button
                          onClick={() => handleStartMaintenance(maintenance.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                        >
                          Start Work
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming maintenance tasks</p>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/maintenance/report')}
              className="flex items-center justify-center space-x-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <ClipboardCheck className="h-5 w-5 text-green-600" />
              <span className="text-green-600 font-medium">Submit Report</span>
            </button>
            <button
              onClick={() => navigate('/maintenance/spare-parts')}
              className="flex items-center justify-center space-x-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Package2 className="h-5 w-5 text-purple-600" />
              <span className="text-purple-600 font-medium">Check Inventory</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Spare Parts Inventory</h2>
            <Link 
              to="/maintenance/spare-parts"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Inventory
            </Link>
          </div>
        </motion.div>
      </div>
    </SharedLayout>
  );
};

export default MaintenanceTechDashboard;