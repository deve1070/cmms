import React, { useState, useEffect } from 'react';
import { reportsApi } from '../services/api';
import {
  RefreshCw,
  BarChart,
  AlertTriangle,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import BiomedicalLayout from '../components/BiomedicalLayout';

interface Report {
  id: string;
  type: string;
  title: string;
  content: string;
  period: string;
  metrics: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const BiomedicalReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState<keyof Report>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await reportsApi.getPerformance({});
      setReports(data as Report[]);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
      (report.title?.toLowerCase() || '').includes(searchString) ||
      (report.content?.toLowerCase() || '').includes(searchString) ||
      (report.type?.toLowerCase() || '').includes(searchString);

    const matchesType = filterType === 'all' || report.type === filterType;

    return matchesSearch && matchesType;
  });

  const sortedReports = React.useMemo(() => {
    return [...filteredReports].sort((a, b) => {
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
  }, [filteredReports, sortField, sortDirection]);

  const handleSort = (field: keyof Report) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIndicator = ({ fieldName }: { fieldName: keyof Report }) => {
    if (sortField !== fieldName) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400 ml-1 inline-block" />;
    }
    return sortDirection === 'asc' ?
      <ChevronUp className="h-4 w-4 text-blue-600 ml-1 inline-block" /> :
      <ChevronDown className="h-4 w-4 text-blue-600 ml-1 inline-block" />;
  };

  const uniqueTypes = ['all', ...Array.from(new Set(reports.map(report => report.type)))];

  return (
    <BiomedicalLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <button
            onClick={fetchReports}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                      <button onClick={() => handleSort('type')} className="flex items-center hover:text-blue-600">
                        Type <SortIndicator fieldName="type" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('period')} className="flex items-center hover:text-blue-600">
                        Period <SortIndicator fieldName="period" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('createdAt')} className="flex items-center hover:text-blue-600">
                        Created <SortIndicator fieldName="createdAt" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('updatedAt')} className="flex items-center hover:text-blue-600">
                        Updated <SortIndicator fieldName="updatedAt" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.period}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.updatedAt).toLocaleDateString()}
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

export default BiomedicalReports;