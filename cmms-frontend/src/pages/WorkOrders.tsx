import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workOrdersApi } from '../services/api';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface WorkOrder {
  id: string;
  equipmentId: string;
  issue: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  type?: string;      // Added
  priority?: string;  // Added
}

const WorkOrders: React.FC = () => {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all'); // New filter
  const [filterType, setFilterType] = useState('all');         // New filter
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false); // New filter
  const [sortField, setSortField] = useState<keyof WorkOrder | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setIsLoading(true);
        const data = await workOrdersApi.getAll() as WorkOrder[];
        setWorkOrders(data);
      } catch (error) {
        console.error('Error fetching work orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  const filteredWorkOrders = workOrders.filter(item => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
      (item.issue?.toLowerCase() || '').includes(searchString) ||
      (item.assignedTo?.toLowerCase() || '').includes(searchString) ||
      (item.reportedBy?.toLowerCase() || '').includes(searchString) ||
      (item.equipmentId?.toLowerCase() || '').includes(searchString) ||
      (item.type?.toLowerCase() || '').includes(searchString) ||
      (item.priority?.toLowerCase() || '').includes(searchString);

    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || item.priority?.toLowerCase() === filterPriority.toLowerCase();
    const matchesType = filterType === 'all' || item.type?.toLowerCase() === filterType.toLowerCase();

    let matchesUnassigned = true;
    if (showUnassignedOnly) {
      matchesUnassigned = !item.assignedTo || item.assignedTo.toLowerCase() === 'unassigned' || item.assignedTo.trim() === '';
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesUnassigned;
  });

  const sortedAndFilteredWorkOrders = React.useMemo(() => {
    let sortedItems = [...filteredWorkOrders];
    if (sortField) {
      sortedItems.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;

        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (valA instanceof Date && valB instanceof Date) {
          comparison = valA.getTime() - valB.getTime();
        } else if (typeof valA === 'string' && Date.parse(valA) && typeof valB === 'string' && Date.parse(valB)) {
          comparison = new Date(valA).getTime() - new Date(valB).getTime();
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    return sortedItems;
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

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
        <button
          onClick={() => navigate('/work-orders/new')} // Updated navigation
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2 stroke-1" />
          New Work Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        {/* Search and Filters Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 stroke-1" />
              <input
                type="text"
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
           <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        {/* Filters Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
           <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
              <option value="calibration">Calibration</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="unassignedOnly"
              checked={showUnassignedOnly}
              onChange={(e) => setShowUnassignedOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="unassignedOnly" className="text-sm text-gray-700">Show only unassigned</label>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <button onClick={() => handleSort('issue')} className="flex items-center hover:text-blue-600">Issue <SortIndicator fieldName="issue" /></button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {/* TODO: Fetch and display equipment model/serial instead of ID. */}
                    <button onClick={() => handleSort('equipmentId')} className="flex items-center hover:text-blue-600">Equipment ID <SortIndicator fieldName="equipmentId" /></button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <button onClick={() => handleSort('status')} className="flex items-center hover:text-blue-600">Status <SortIndicator fieldName="status" /></button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <button onClick={() => handleSort('priority')} className="flex items-center hover:text-blue-600">Priority <SortIndicator fieldName="priority" /></button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <button onClick={() => handleSort('type')} className="flex items-center hover:text-blue-600">Type <SortIndicator fieldName="type" /></button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <button onClick={() => handleSort('assignedTo')} className="flex items-center hover:text-blue-600">Assigned To <SortIndicator fieldName="assignedTo" /></button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <button onClick={() => handleSort('reportedBy')} className="flex items-center hover:text-blue-600">Reported By <SortIndicator fieldName="reportedBy" /></button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <button onClick={() => handleSort('createdAt')} className="flex items-center hover:text-blue-600">Created <SortIndicator fieldName="createdAt" /></button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <button onClick={() => handleSort('updatedAt')} className="flex items-center hover:text-blue-600">Updated <SortIndicator fieldName="updatedAt" /></button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAndFilteredWorkOrders.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/work-orders/${item.id}`)} // Updated navigation
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.issue}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.equipmentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.priority || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.assignedTo || 'Unassigned'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.reportedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrders; 