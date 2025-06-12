import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { equipmentApi } from '../services/api';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

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
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]); // Renamed state variable
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchEquipmentList = async () => { // Renamed function
      try {
        setIsLoading(true);
        const data = await equipmentApi.getAll() as Equipment[]; // Assuming getAll returns data matching the new interface
        setEquipmentList(data);
      } catch (error) {
        console.error('Error fetching equipment list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipmentList();
  }, []);

  const filteredEquipment = equipmentList.filter(item => { // Changed to equipmentList
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
      item.modelNumber.toLowerCase().includes(searchString) ||
      item.serialNumber.toLowerCase().includes(searchString) ||
      item.manufacturerName.toLowerCase().includes(searchString) ||
      item.locationDescription.toLowerCase().includes(searchString) ||
      item.category.toLowerCase().includes(searchString) ||
      item.department.toLowerCase().includes(searchString);
    const matchesStatus = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Equipment['status']) => { // Typed status parameter
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipment List</h1>
        <button
          onClick={() => navigate('/equipment/new')} // Updated navigation path
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2 stroke-1" />
          Add Equipment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 stroke-1" />
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
            <FunnelIcon className="h-5 w-5 text-gray-400 stroke-1" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="operational">Operational</option>
              <option value="needs calibration">Needs Calibration</option>
              <option value="maintenance due">Maintenance Due</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Date</th>
                  {/* Removed last/next maintenance for brevity, can be added back if needed */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEquipment.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/equipment/edit/${item.id}`)} // Updated navigation path
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
                      {new Date(item.installationDate).toLocaleDateString()}
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