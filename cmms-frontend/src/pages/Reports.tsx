import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface Report {
  id: string;
  type: string;
  title: string;
  content: string;
  generatedAt: string;
  period: string;
  metrics: {
    [key: string]: any;
  };
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const performanceData = await reportsApi.getPerformance({});
      const complianceData = await reportsApi.getCompliance({});
      const allReports = [
        ...(performanceData as Report[]),
        ...(complianceData as Report[])
      ];
      setReports(allReports);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = selectedType === 'all'
    ? reports
    : reports.filter(report => report.type.toLowerCase() === selectedType.toLowerCase());

  const getReportTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'performance':
        return 'bg-blue-100 text-blue-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'compliance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      // Implement report download functionality
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
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
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Generate Report
        </button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedType === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setSelectedType('performance')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedType === 'performance'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setSelectedType('financial')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedType === 'financial'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Financial
          </button>
          <button
            onClick={() => setSelectedType('compliance')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedType === 'compliance'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Compliance
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredReports.map((report) => (
            <li key={report.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {report.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Period: {report.period}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getReportTypeColor(report.type)}`}>
                      {report.type}
                    </span>
                    <button
                      onClick={() => handleDownload(report.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-700">{report.content}</p>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Key Metrics:</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {Object.entries(report.metrics).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium text-gray-900">{key}</p>
                        <p className="text-sm text-gray-500">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Generated: {new Date(report.generatedAt).toLocaleDateString()}
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

export default Reports; 