import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { complianceApi } from '../services/api';
import { ComplianceRequirement } from '../types/compliance';
import { toast } from 'react-hot-toast';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  RefreshCw,
} from 'lucide-react';
import AddComplianceForm from '../components/AddComplianceForm';

const Compliance: React.FC = () => {
  const [compliance, setCompliance] = useState<ComplianceRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCompliance();
  }, [selectedCategory]);

  const fetchCompliance = async () => {
    try {
      const data = await complianceApi.getAll();
      const filteredData = selectedCategory === 'all'
        ? data
        : data.filter(item => item.category === selectedCategory);
      setCompliance(filteredData);
    } catch (error) {
      toast.error('Failed to fetch compliance records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600';
      case 'non-compliant':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'non-compliant':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
      default:
        return null;
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
        <h1 className="text-2xl font-bold text-gray-900">Compliance Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchCompliance()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Compliance Record
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Compliance Record</h2>
            <AddComplianceForm
              onSuccess={() => {
                setShowAddForm(false);
                fetchCompliance();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="category" className="text-sm font-medium text-gray-700">
            Category:
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Categories</option>
            <option value="safety">Safety</option>
            <option value="environmental">Environmental</option>
            <option value="regulatory">Regulatory</option>
            <option value="quality">Quality</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {compliance.map((item) => (
            <li key={item.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShieldCheck className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.standard} - {item.requirement}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Last Check: {new Date(item.lastChecked).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>Assigned to: {item.assignedTo}</p>
                  </div>
                </div>
                {item.notes && (
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Notes: {item.notes}</p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Compliance;