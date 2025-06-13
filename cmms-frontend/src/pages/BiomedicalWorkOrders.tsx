import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workOrdersApi } from '../services/api';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import BiomedicalLayout from '../components/BiomedicalLayout';
import { WorkOrder } from '../types/workOrder';

const BiomedicalWorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof WorkOrder>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setIsLoading(true);
      const data = await workOrdersApi.getAll();
      setWorkOrders(data);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWorkOrders = workOrders.filter(order => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
      (order.title?.toLowerCase() || '').includes(searchString) ||
      (order.description?.toLowerCase() || '').includes(searchString) ||
      (order.equipmentName?.toLowerCase() || '').includes(searchString) ||
      (order.assignedTo?.toLowerCase() || '').includes(searchString);

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || order.priority === filterPriority;
    const matchesType = filterType === 'all' || order.type === filterType;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const sortedWorkOrders = React.useMemo(() => {
    return [...filteredWorkOrders].sort((a, b) => {
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
  }, [filteredWorkOrders, sortField, sortDirection]);

  const handleSort = (field: keyof WorkOrder) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIndicator = ({ fieldName }: { fieldName: keyof WorkOrder }) => {
    if (sortField !== fieldName) {
      return <ChevronUpDownIcon className="h-4 w-4 text-gray-400 ml-1 inline-block" />;
    }
    return sortDirection === 'asc' ?
      <ChevronUpIcon className="h-4 w-4 text-blue-600 ml-1 inline-block" /> :
      <ChevronDownIcon className="h-4 w-4 text-blue-600 ml-1 inline-block" />;
  };

  const uniqueStatuses = ['all', ...Array.from(new Set(workOrders.map(order => order.status)))];
  const uniquePriorities = ['all', ...Array.from(new Set(workOrders.map(order => order.priority)))];
  const uniqueTypes = ['all', 'preventive', 'corrective', 'inspection', 'calibration', 'repair'];

  return (
    <BiomedicalLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <div className="flex space-x-4">
            <Link
              to="/biomedical/work-orders/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Work Order
            </Link>
            <button
              onClick={fetchWorkOrders}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <input
                type="text"
                placeholder="Search work orders..."
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
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {uniquePriorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority === 'all' ? 'All Priorities' : priority}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('title')} className="flex items-center hover:text-blue-600">
                        Title <SortIndicator fieldName="title" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('status')} className="flex items-center hover:text-blue-600">
                        Status <SortIndicator fieldName="status" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('priority')} className="flex items-center hover:text-blue-600">
                        Priority <SortIndicator fieldName="priority" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('type')} className="flex items-center hover:text-blue-600">
                        Type <SortIndicator fieldName="type" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('equipmentName')} className="flex items-center hover:text-blue-600">
                        Equipment <SortIndicator fieldName="equipmentName" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('assignedTo')} className="flex items-center hover:text-blue-600">
                        Assigned To <SortIndicator fieldName="assignedTo" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('dueDate')} className="flex items-center hover:text-blue-600">
                        Due Date <SortIndicator fieldName="dueDate" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedWorkOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.priority === 'high' ? 'bg-red-100 text-red-800' :
                          order.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.equipmentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.assignedTo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.dueDate).toLocaleDateString()}
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

export default BiomedicalWorkOrders; 