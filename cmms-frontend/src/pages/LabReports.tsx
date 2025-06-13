import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { MaintenanceReport } from '../types/maintenance';

const LabReports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'preventive' | 'corrective'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const data = await maintenanceApi.getAll();
        setReports(data as MaintenanceReport[]);
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast.error('Failed to fetch maintenance reports');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.equipment?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.equipment?.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: MaintenanceReport['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: MaintenanceReport['type']) => {
    switch (type) {
      case 'preventive':
        return <CalendarIcon className="h-5 w-5 text-blue-600" />;
      case 'corrective':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
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
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-blue-900">Maintenance Reports</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-blue-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-blue-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(report.type)}
                  <div>
                    <h3 className="font-semibold text-blue-900">{report.equipment?.model || 'Unknown Model'}</h3>
                    <p className="text-sm text-blue-600">S/N: {report.equipment?.serialNumber || 'Unknown'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                  {report.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-blue-600">
                  <BeakerIcon className="h-4 w-4 mr-2" />
                  <span>{report.equipment?.location || 'Unknown Location'}</span>
                </div>

                <div className="flex items-center text-sm text-blue-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>Date: {new Date(report.date).toLocaleDateString()}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-100">
                  <p className="text-sm text-blue-900 font-medium mb-2">Description</p>
                  <p className="text-sm text-blue-600">{report.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabReports; 