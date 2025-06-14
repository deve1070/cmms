import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { equipmentApi } from '../services/api';
import {
  Plus,
  Search,
  Filter,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

// TODO: Move to a shared types file
interface Equipment {
  id: string;
  serialNumber: string;
  manufacturerName: string;
  modelNumber: string;
  manufacturerServiceNumber?: string | null;
  vendorName?: string | null;
  vendorCode?: string | null;
  locationDescription: string;
  locationCode?: string | null;
  purchasePrice: number;
  installationDate: string;
  warrantyExpirationDate: string;
  status: 'Operational' | 'Needs Maintenance' | 'Out of Service' | 'Decommissioned';
  category: string;
  department: string;
  lastMaintenance?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const EquipmentList: React.FC = () => {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<keyof Equipment | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchEquipmentList = async () => {
      try {
        setIsLoading(true);
        const data = await equipmentApi.getAll() as Equipment[];
        setEquipmentList(data);
      } catch (error) {
        console.error('Error fetching equipment list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipmentList();
  }, []);

  const filteredEquipment = equipmentList.filter(item => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
      (item.modelNumber?.toLowerCase() || '').includes(searchString) ||
      (item.serialNumber?.toLowerCase() || '').includes(searchString) ||
      (item.manufacturerName?.toLowerCase() || '').includes(searchString) ||
      (item.locationDescription?.toLowerCase() || '').includes(searchString) ||
      (item.category?.toLowerCase() || '').includes(searchString) ||
      (item.department?.toLowerCase() || '').includes(searchString);
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedAndFilteredEquipment = React.useMemo(() => {
    let sortedItems = [...filteredEquipment];
    if (sortField) {
      sortedItems = sortData(sortedItems, sortField, sortDirection);
    }
    return sortedItems;
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
      return <ChevronsUpDown className="h-4 w-4 text-gray-400 ml-1 inline-block" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-4 w-4 text-blue-600 ml-1 inline-block" />;
    }
    return <ChevronDown className="h-4 w-4 text-blue-600 ml-1 inline-block" />;
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

  const sortData = (data: Equipment[], sortKey: keyof Equipment, sortDirection: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      let comparison = 0;

      if (valA === null || valA === undefined) {
        comparison = 1;
      } else if (valB === null || valB === undefined) {
        comparison = -1;
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (valA && valB && typeof valA === 'object' && typeof valB === 'object' && 'getTime' in valA && 'getTime' in valB) {
        comparison = (valA as Date).getTime() - (valB as Date).getTime();
      } else if (typeof valA === 'string' && Date.parse(valA) && typeof valB === 'string' && Date.parse(valB)) {
        comparison = new Date(valA).getTime() - new Date(valB).getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipment List</h1>
        <button
          onClick={() => navigate('/equipment/new')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2 stroke-1" />
          Add Equipment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 stroke-1" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400 stroke-1" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Operational">Operational</option>
              <option value="Needs Maintenance">Needs Maintenance</option>
              <option value="Out of Service">Out of Service</option>
              <option value="Decommissioned">Decommissioned</option>
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
                    <button onClick={() => handleSort('manufacturerName')} className="flex items-center hover:text-blue-600">
                      Manufacturer <SortIndicator fieldName="manufacturerName" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('modelNumber')} className="flex items-center hover:text-blue-600">
                      Model <SortIndicator fieldName="modelNumber" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('serialNumber')} className="flex items-center hover:text-blue-600">
                      Serial No. <SortIndicator fieldName="serialNumber" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('locationDescription')} className="flex items-center hover:text-blue-600">
                      Location <SortIndicator fieldName="locationDescription" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('status')} className="flex items-center hover:text-blue-600">
                      Status <SortIndicator fieldName="status" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('installationDate')} className="flex items-center hover:text-blue-600">
                      Install Date <SortIndicator fieldName="installationDate" />
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
                {sortedAndFilteredEquipment.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/equipment/edit/${item.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.manufacturerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.modelNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.serialNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.locationDescription}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.installationDate ? new Date(item.installationDate).toLocaleDateString() : 'N/A'}
                    </td>
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
  );
};

export default EquipmentList;