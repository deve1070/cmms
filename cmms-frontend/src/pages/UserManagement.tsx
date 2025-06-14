import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { User, FrontendUserRole, getUserRoleDisplayName } from '../types/auth';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Shield,
  Lock,
} from 'lucide-react';

interface ExtendedUser extends User {
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    try {
      const data: ExtendedUser[] = await usersApi.getAll();
      const mappedUsers: ExtendedUser[] = data.map((u) => ({
        ...u,
        status: u.status || 'active',
        lastLogin: u.lastLogin || undefined,
      }));
      const filteredData = selectedRole === 'all'
        ? mappedUsers
        : mappedUsers.filter((user) => user.role === selectedRole);
      setUsers(filteredData);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ExtendedUser['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: FrontendUserRole) => {
    switch (role) {
      case 'admin':
        return 'text-purple-600';
      case 'engineer for maintenance':
        return 'text-blue-600';
      case 'laboratory technician':
        return 'text-green-600';
      case 'biomedical engineer':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleStatusChange = async (userId: string, newStatus: ExtendedUser['status']) => {
    try {
      await usersApi.updateStatus(userId, newStatus || 'active');
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersApi.delete(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchUsers()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <Link
            to="/admin/users/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add User
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="role" className="text-sm font-medium text-gray-700">
            Role:
          </label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="engineer for maintenance">Maintenance Technician</option>
            <option value="laboratory technician">Lab Technician</option>
            <option value="biomedical engineer">Biomedical Engineer</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        user.status,
                      )}`}
                    >
                      {user.status || 'active'}
                    </span>
                    <span className={`text-sm font-medium ${getRoleColor(user.role)}`}>
                      {getUserRoleDisplayName(user.role)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Last login:{' '}
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      <Shield className="h-4 w-4 mr-1" />
                      {user.permissions.length} permissions
                    </p>
                  </div>
                  <div className="mt-2 flex items-center space-x-2 sm:mt-0">
                    <button
                      onClick={() =>
                        handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')
                      }
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link
                      to={`/admin/users/edit/${user.id}`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserManagement;