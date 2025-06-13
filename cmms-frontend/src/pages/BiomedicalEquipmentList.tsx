import React, { useState, useEffect } from 'react';
import { equipmentApi } from '../services/api';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import BiomedicalLayout from '../components/BiomedicalLayout';
import { Equipment } from '../types/equipment';

const BiomedicalEquipmentList: React.FC = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortField, setSortField] = useState<keyof Equipment>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await equipmentApi.getAll();
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
      (item.name?.toLowerCase() || '').includes(searchString) ||
      (item.category?.toLowerCase() || '').includes(searchString) ||
      (item.location?.toLowerCase() || '').includes(searchString) ||
      (item.manufacturer?.toLowerCase() || '').includes(searchString) ||
      (item.model?.toLowerCase() || '').includes(searchString) ||
      (item.serialNumber?.toLowerCase() || '').includes(searchString);

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedEquipment = React.useMemo(() => {
    return [...filteredEquipment].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      let comparison = 0;

      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (valA && valB && typeof valA === 'object' && typeof valB === 'object') {
        comparison = new Date(valA as any).getTime() - new Date(valB as any).getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredEquipment, sortField, sortDirection]);

  const handleSort = (field: keyof Equipment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIndicator = ({ fieldName }: { fieldName: keyof Equipment }) => {
    if (sortField !== fieldName) {
      return <ChevronUpDownIcon className="h-4 w-4 text-gray-400 ml-1 inline-block" />;
    }
    return sortDirection === 'asc' ?
      <ChevronUpIcon className="h-4 w-4 text-blue-600 ml-1 inline-block" /> :
      <ChevronDownIcon className="h-4 w-4 text-blue-600 ml-1 inline-block" />;
  };

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800';
      case 'Needs Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Service':
        return 'bg-red-100 text-red-800';
      case 'Decommissioned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueCategories = ['all', ...Array.from(new Set(equipment.map(item => item.category)))];
  const uniqueStatuses = ['all', ...Array.from(new Set(equipment.map(item => item.status)))];

  return (
    <BiomedicalLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Equipment List</h1>
          <button
            onClick={fetchEquipment}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('name')} className="flex items-center hover:text-blue-600">
                        Name <SortIndicator fieldName="name" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('model')} className="flex items-center hover:text-blue-600">
                        Model <SortIndicator fieldName="model" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('serialNumber')} className="flex items-center hover:text-blue-600">
                        Serial Number <SortIndicator fieldName="serialNumber" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('status')} className="flex items-center hover:text-blue-600">
                        Status <SortIndicator fieldName="status" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('location')} className="flex items-center hover:text-blue-600">
                        Location <SortIndicator fieldName="location" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('category')} className="flex items-center hover:text-blue-600">
                        Category <SortIndicator fieldName="category" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('lastMaintenance')} className="flex items-center hover:text-blue-600">
                        Last Maintenance <SortIndicator fieldName="lastMaintenance" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedEquipment.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.model}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.serialNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </BiomedicalLayout>
  );
};

export default BiomedicalEquipmentList; 