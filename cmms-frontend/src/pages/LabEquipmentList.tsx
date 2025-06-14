import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { equipmentApi, maintenanceApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Beaker,
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Equipment } from '../types/equipment';
import { MaintenanceReport } from '../types/maintenance';

const LabEquipmentList: React.FC = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [equipmentData, maintenanceData] = await Promise.all([
          equipmentApi.getAll(),
          maintenanceApi.getAll({})
        ]);

        setEquipment(equipmentData as Equipment[]);
        setMaintenanceRecords(maintenanceData as MaintenanceReport[]);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = 
      (item.model?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.serialNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.location?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'needs calibration':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance required':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatus = (equipmentId: string) => {
    const record = maintenanceRecords.find(r => r.equipmentId === equipmentId);
    if (!record) return null;

    return {
      status: record.status,
      date: record.date,
      description: record.description,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/lab/dashboard')}
              className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-blue-900">Equipment Status</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-blue-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="operational">Operational</option>
                <option value="needs calibration">Needs Calibration</option>
                <option value="maintenance required">Maintenance Required</option>
              </select>
            </div>
          </div>
        </div>

        {/* Equipment List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => {
            const maintenance = getMaintenanceStatus(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-blue-900">{item.model}</h3>
                    <p className="text-sm text-blue-600">S/N: {item.serialNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-blue-600">
                    <Beaker className="h-4 w-4 mr-2" />
                    <span>{item.location}</span>
                  </div>

                  <div className="flex items-center text-sm text-blue-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Last Maintenance: {item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString() : 'Not scheduled'}</span>
                  </div>

                  <div className="flex items-center text-sm text-blue-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Next Maintenance: {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : 'Not scheduled'}</span>
                  </div>

                  {maintenance && (
                    <div className="mt-4 pt-4 border-t border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Maintenance Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          maintenance.status === 'completed' ? 'bg-green-100 text-green-800' :
                          maintenance.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {maintenance.status ? maintenance.status.replace('_', ' ') : 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-blue-600">{maintenance.description}</p>
                      <p className="text-xs text-blue-500 mt-1">
                        Date: {new Date(maintenance.date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LabEquipmentList;