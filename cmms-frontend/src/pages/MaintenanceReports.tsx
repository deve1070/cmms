import React, { useState, useEffect } from 'react';
import { maintenanceApi } from '../services/api';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface MaintenanceReport {
  id: string;
  equipmentId: string;
  type: 'preventive' | 'corrective';
  description: string;
  performedBy: string;
  date: string;
  cost?: number;
  partsUsed?: string;
  equipment: {
    model: string;
    serialNumber: string;
    location: string;
  };
}

const MaintenanceReports: React.FC = () => {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
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
        const data = await maintenanceApi.getAll({}) as MaintenanceReport[];
        setReports(data);
      } catch (error) {
        console.error('Error fetching maintenance reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.type === filter;
  }).filter(report => {
    const reportDate = new Date(report.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    return reportDate >= startDate && reportDate <= endDate;
  });

  const totalCost = filteredReports.reduce((sum, report) => sum + (report.cost || 0), 0);
  const preventiveCount = filteredReports.filter(r => r.type === 'preventive').length;
  const correctiveCount = filteredReports.filter(r => r.type === 'corrective').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Maintenance Reports</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Maintenance Type
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="w-full p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Total Cost</p>
                <p className="text-2xl font-semibold text-blue-900">${totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Preventive Maintenance</p>
                <p className="text-2xl font-semibold text-blue-900">{preventiveCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Corrective Maintenance</p>
                <p className="text-2xl font-semibold text-blue-900">{correctiveCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-blue-600">Loading reports...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-900">
                          {report.equipment.model}
                        </div>
                        <div className="text-sm text-blue-600">
                          S/N: {report.equipment.serialNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.type === 'preventive' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-blue-900">{report.description}</div>
                        {report.partsUsed && (
                          <div className="text-sm text-blue-600">
                            Parts: {report.partsUsed}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        {new Date(report.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                        ${report.cost?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceReports; 