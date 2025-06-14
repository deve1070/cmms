import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { usersApi, equipmentApi, workOrdersApi, reportsApi } from 'services/api';
import { User, getUserDisplayName } from 'types/auth';
import {
  BarChart3,
  Users,
  Package2,
  FileText,
  ClipboardCheck,
  User as UserIcon,
  LogOut,
  Menu,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Wrench,
  X,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Overview', icon: BarChart3, path: '/admin/dashboard' },
  { name: 'User Management', icon: Users, path: '/admin/users' },
  { name: 'Equipment Management', icon: Package2, path: '/admin/equipment' },
  { name: 'Repair Requests', icon: FileText, path: '/admin/repair-requests' },
  { name: 'Maintenance Reports', icon: ClipboardCheck, path: '/admin/maintenance-reports' },
];

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
  details: string;
  time: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

interface WorkOrder {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  issue: string;
  equipmentId: string;
  assignedTo: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Equipment {
  id: string;
  serialNumber: string;
  model: string;
  location: string;
  status: string;
  department: string;
}

const AdminDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEquipment: 0,
    activeWorkOrders: 0,
    pendingMaintenance: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
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
          activeWorkOrders: workOrders.filter((wo) => wo.status === 'In Progress').length,
          pendingMaintenance: workOrders.filter((wo) => wo.status === 'Reported').length,
        });

        const activities: RecentActivity[] = [
          ...users.slice(0, 2).map((user) => ({
            id: user.id,
            type: 'user' as const,
            action: 'New user registered',
            details: `${getUserDisplayName(user)} joined as ${user.role}`,
            time: 'Recently',
            icon: Users,
            color: 'text-blue-500',
          })),
          ...workOrders.slice(0, 2).map((wo) => ({
            id: wo.id,
            type: wo.status === 'Completed' ? 'repair' as const : 'equipment' as const,
            action: wo.status === 'Completed' ? 'Repair request completed' : 'Equipment maintenance required',
            details: wo.issue || '',
            time: 'Recently',
            icon: wo.status === 'Completed' ? CheckCircle2 : Wrench,
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

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-70 bg-white shadow-lg z-30"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              <Package2 className="h-8 w-8 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
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

        <div className="absolute bottom-0 w-full p-6 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <UserIcon className="h-8 w-8 text-gray-600" />
            <div>
              <p className="font-medium text-gray-800">{getUserDisplayName(user, 'Administrator')}</p>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-6 w-6" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-70' : 'ml-0'}`}>
        <header className="bg-white shadow-md">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 mr-4 transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="p-2 rounded-lg hover:bg-gray-100 relative transition-colors duration-200"
              >
                <Bell className="h-6 w-6 text-gray-600" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats.activeWorkOrders + stats.pendingMaintenance}
                </span>
              </button>
            </div>
          </div>
        </header>
        <main className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => handleQuickAction('add-user')}
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-blue-600"
                  >
                    <Plus className="h-6 w-6" />
                    <span>Add User</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('add-equipment')}
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-green-600"
                  >
                    <Package2 className="h-6 w-6" />
                    <span>Add Equipment</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('new-maintenance')}
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-yellow-600"
                  >
                    <Wrench className="h-6 w-6" />
                    <span>New Maintenance</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('generate-report')}
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-center space-x-2 text-purple-600"
                  >
                    <FileText className="h-6 w-6" />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Total Equipment</h3>
                    <Package2 className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-4xl font-bold text-green-600">{stats.totalEquipment}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Active Work Orders</h3>
                    <Wrench className="h-8 w-8 text-yellow-500" />
                  </div>
                  <p className="text-4xl font-bold text-yellow-600">{stats.activeWorkOrders}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Pending Maintenance</h3>
                    <Clock className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-4xl font-bold text-red-600">{stats.pendingMaintenance}</p>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50"
                    >
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
      </div>
    </div>
  );
};

export default AdminDashboard;