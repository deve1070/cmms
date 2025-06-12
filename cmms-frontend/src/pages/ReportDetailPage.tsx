import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportsApi } from '../services/api'; // Ensure this path is correct
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, ExclamationTriangleIcon, DocumentChartBarIcon, TableCellsIcon, ChartPieIcon } from '@heroicons/react/24/outline';

// Interface for the Report (should match backend and Reports.tsx)
interface Report {
  id: string;
  type: string;
  title: string;
  content: string; // JSON string
  generatedAt: string; // ISO DateTime string
  generatedBy: string; // User ID or username
  period: string;
  metrics: string; // JSON string
}

// Specific content types for structured display
interface DowntimeReportContentItem {
  equipmentId: string;
  equipmentName: string;
  totalDowntimeHours: number;
  workOrderCount: number;
  averageDowntimeHours: number;
}

interface MaintenanceCostContentItem {
  equipmentId?: string; // Might be overall, not per equipment
  equipmentName?: string;
  totalDirectCosts: number;
  totalPartsCost: number;
  totalCombinedCost: number;
  workOrderCount?: number; // If costs are broken down by WO counts per equipment
}

interface StaffEfficiencyContentItem {
  technicianId: string;
  technicianName: string;
  totalCompleted: number;
  completedByType: Record<string, number>; // e.g., { "Corrective": 10, "Preventive": 5 }
  avgCompletionTimeHours: number;
}


const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);
  const [parsedContent, setParsedContent] = useState<any | null>(null);
  const [parsedMetrics, setParsedMetrics] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportDetails = useCallback(async () => {
    if (!id) {
      setError("Report ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getById(id);
      setReport(data as Report);

      if (data.content) {
        try {
          setParsedContent(JSON.parse(data.content));
        } catch (e) {
          console.error("Error parsing report content JSON:", e);
          setParsedContent({ error: "Content data is not valid JSON." });
          toast.error("Failed to parse report content data.");
        }
      } else {
        setParsedContent(null);
      }

      if (data.metrics) {
        try {
          setParsedMetrics(JSON.parse(data.metrics));
        } catch (e) {
          console.error("Error parsing report metrics JSON:", e);
          setParsedMetrics({ error: "Metrics data is not valid JSON." });
          toast.error("Failed to parse report metrics data.");
        }
      } else {
        setParsedMetrics(null);
      }

    } catch (err) {
      console.error('Error fetching report details:', err);
      setError('Failed to load report details.');
      toast.error('Failed to load report details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReportDetails();
  }, [fetchReportDetails]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate('/reports')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Back to Reports</button>
      </div>
    );
  }

  if (!report) {
    return <div className="p-6 text-center">Report not found or an error occurred.</div>;
  }

  const renderMetrics = () => {
    if (!parsedMetrics) return <p className="text-sm text-gray-500">No metrics available.</p>;
    if (parsedMetrics.error) return <p className="text-sm text-red-500">Error: {parsedMetrics.error}</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(parsedMetrics).map(([key, value]) => (
          <div key={key} className="bg-gray-100 p-4 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
            <p className="text-xl font-semibold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : String(value)}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderContentTable = () => {
    if (!parsedContent) return <p className="mt-4 text-gray-600">No detailed content available for this report.</p>;
    if (parsedContent.error) return <p className="mt-4 text-red-600">Error displaying content: {parsedContent.error}</p>;
    if (!Array.isArray(parsedContent) || parsedContent.length === 0) return <p className="mt-4 text-gray-600">No data items in report content.</p>;

    // Downtime Report
    if (report.type === 'Performance' && report.title.toLowerCase().includes('downtime')) {
      const contentData = parsedContent as DowntimeReportContentItem[];
      return (
        <table className="min-w-full divide-y divide-gray-200 mt-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Downtime (Hours)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WO Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Downtime (Hours)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contentData.map((item, index) => (
              <tr key={item.equipmentId || index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.equipmentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.totalDowntimeHours.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.workOrderCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.averageDowntimeHours.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    // Maintenance Costs Report
    else if (report.type === 'Financial' && report.title.toLowerCase().includes('maintenance costs')) {
      const contentData = parsedContent as MaintenanceCostContentItem[];
       return (
        <table className="min-w-full divide-y divide-gray-200 mt-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Direct Costs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Parts Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Total Costs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WO Count</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contentData.map((item, index) => (
              <tr key={item.equipmentId || `overall-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.equipmentName || 'N/A (Overall)'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.totalDirectCosts.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.totalPartsCost.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">${item.totalCombinedCost.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.workOrderCount || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    // Staff Efficiency Report
    else if (report.type === 'StaffEfficiency' && report.title.toLowerCase().includes('staff efficiency')) {
       const contentData = parsedContent as StaffEfficiencyContentItem[];
      return (
        <table className="min-w-full divide-y divide-gray-200 mt-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total WOs Completed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WOs by Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Completion (Hours)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contentData.map((item) => (
              <tr key={item.technicianId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.technicianName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.totalCompleted}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {Object.entries(item.completedByType).map(([type, count]) => `${type}: ${count}`).join(', ') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.avgCompletionTimeHours.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    // Fallback for unknown report content structure
    return <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">{JSON.stringify(parsedContent, null, 2)}</pre>;
  };


  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-start mb-6">
        <button
          onClick={() => navigate('/reports')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Reports List
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center">
            <DocumentChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
            {report.title}
          </h1>
          <div className="text-sm text-gray-500 space-x-4">
            <span>Type: {report.type}</span>
            <span>Period: {report.period}</span>
            <span>Generated: {new Date(report.generatedAt).toLocaleString()} by {report.generatedBy}</span>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
            <ChartPieIcon className="h-6 w-6 mr-2 text-indigo-600" />
            Key Metrics
          </h2>
          {renderMetrics()}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
            <TableCellsIcon className="h-6 w-6 mr-2 text-green-600" />
            Detailed Content
          </h2>
          <div className="overflow-x-auto">
            {renderContentTable()}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReportDetailPage;
