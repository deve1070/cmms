import React, { useState, useEffect } from 'react';
import { equipmentApi, workOrdersApi, maintenanceApi } from '../services/api';
import { Equipment } from '../types/equipment';
import { WorkOrder } from '../types/workOrder';
import { MaintenanceReport } from '../types/maintenance';
import { toast } from 'react-hot-toast';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { FileText, RefreshCw } from 'lucide-react';

interface ReportData {
  equipment: Equipment;
  workOrders: WorkOrder[];
  maintenanceReports: MaintenanceReport[];
}

const EquipmentReportGenerator: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [reportType, setReportType] = useState<'single' | 'multiple'>('single');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const data = await equipmentApi.getAll();
      console.log('Fetched equipment:', data);
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment');
    }
  };

  const handleEquipmentSelect = (equipmentId: string) => {
    console.log('Selecting equipment:', equipmentId);
    if (reportType === 'single') {
      setSelectedEquipment([equipmentId]);
      toast.success('Equipment selected');
    } else {
      setSelectedEquipment(prev => {
        const newSelection = prev.includes(equipmentId)
          ? prev.filter(id => id !== equipmentId)
          : [...prev, equipmentId];
        console.log('New selection:', newSelection);
        toast.success(newSelection.includes(equipmentId) ? 'Equipment added to selection' : 'Equipment removed from selection');
        return newSelection;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'operational';
      case 'Needs Maintenance':
      case 'Maintenance':
        return 'maintenance';
      case 'Out of Service':
      case 'Repair':
        return 'repair';
      case 'Decommissioned':
        return 'decommissioned';
      default:
        return 'unknown';
    }
  };

  const generateReportContent = (reportData: ReportData[]) => {
    const now = new Date();
    let content = `
      <html>
        <head>
          <title>Equipment Maintenance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .status { padding: 4px 8px; border-radius: 4px; }
            .operational { background-color: #e6ffe6; color: #006600; }
            .maintenance { background-color: #fff3e6; color: #cc7700; }
            .repair { background-color: #ffe6e6; color: #cc0000; }
            .decommissioned { background-color: #e6e6e6; color: #666666; }
            .unknown { background-color: #f5f5f5; color: #666666; }
            .info-section { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-weight: bold; color: #4a5568; }
            .info-value { color: #2d3748; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Equipment Maintenance Report</h1>
            <p>Generated on: ${format(now, 'PPpp')}</p>
          </div>
    `;

    reportData.forEach((data, index) => {
      content += `
        <div class="section">
          <h2>Equipment ${index + 1}: ${data.equipment.name}</h2>
          
          <div class="info-section">
            <h3>Equipment Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Model:</span>
                <span class="info-value">${data.equipment.model}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Serial Number:</span>
                <span class="info-value">${data.equipment.serialNumber}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Equipment Type:</span>
                <span class="info-value">${data.equipment.type || 'Not specified'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value status ${getStatusColor(data.equipment.status)}">${data.equipment.status}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Location:</span>
                <span class="info-value">${data.equipment.location || 'Not specified'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Maintenance:</span>
                <span class="info-value">${data.equipment.lastMaintenance ? format(new Date(data.equipment.lastMaintenance), 'PP') : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>Functionality</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Primary Function:</span>
                <span class="info-value">${data.equipment.functionality?.primary || 'Not specified'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Operating Hours:</span>
                <span class="info-value">${data.equipment.functionality?.operatingHours || 'Not tracked'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Efficiency Rating:</span>
                <span class="info-value">${data.equipment.functionality?.efficiencyRating || 'Not rated'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Performance Check:</span>
                <span class="info-value">${data.equipment.functionality?.lastPerformanceCheck ? format(new Date(data.equipment.functionality.lastPerformanceCheck), 'PP') : 'Not performed'}</span>
              </div>
            </div>
          </div>

          <h3>Recent Work Orders</h3>
          <table>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Priority</th>
              <th>Issue</th>
            </tr>
            ${data.workOrders.map(wo => `
              <tr>
                <td>${wo.id}</td>
                <td>${wo.type}</td>
                <td class="status ${getStatusColor(wo.status)}">${wo.status}</td>
                <td>${format(new Date(wo.createdAt), 'PP')}</td>
                <td>${wo.priority}</td>
                <td>${wo.issue || 'N/A'}</td>
              </tr>
            `).join('')}
          </table>

          <h3>Maintenance Reports</h3>
          <table>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Performed By</th>
              <th>Description</th>
              <th>Recommendations</th>
            </tr>
            ${data.maintenanceReports.map(report => `
              <tr>
                <td>${format(new Date(report.createdAt), 'PP')}</td>
                <td>${report.type}</td>
                <td>${report.performedBy.username}</td>
                <td>${report.description}</td>
                <td>${report.recommendations || 'N/A'}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `;
    });

    content += `
        </body>
      </html>
    `;

    return content;
  };

  const printReport = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      toast.error('Please allow popups to print the report');
    }
  };

  const handleGenerateReport = async () => {
    if (selectedEquipment.length === 0) {
      toast.error('Please select at least one equipment');
      return;
    }

    setIsLoading(true);
    try {
      const reportData = await Promise.all(
        selectedEquipment.map(async (equipmentId) => {
          const [equipmentDetails, workOrders, maintenanceReports] = await Promise.all([
            equipmentApi.getById(equipmentId),
            workOrdersApi.getAll(),
            maintenanceApi.getAll()
          ]);

          return {
            equipment: equipmentDetails,
            workOrders: workOrders.filter(wo => wo.equipmentId === equipmentId),
            maintenanceReports: maintenanceReports.filter(report => report.equipmentId === equipmentId)
          } as ReportData;
        })
      );

      const reportContent = generateReportContent(reportData);
      printReport(reportContent);
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Equipment Report Generator</h2>
        <div className="flex items-center gap-4">
          <Select value={reportType} onValueChange={(value: 'single' | 'multiple') => {
            setReportType(value);
            setSelectedEquipment([]); // Clear selection when changing report type
            toast(`Report type changed to ${value}`, {
              icon: '📋',
              duration: 2000
            });
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Equipment</SelectItem>
              <SelectItem value="multiple">Multiple Equipment</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleGenerateReport}
            disabled={isLoading || selectedEquipment.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleEquipmentSelect(item.id)}
            className={`w-full text-left p-4 border rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectedEquipment.includes(item.id)
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.model}</p>
            <p className="text-sm text-gray-500">S/N: {item.serialNumber}</p>
            <Badge
              className={`mt-2 ${
                item.status === 'Operational'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {item.status}
            </Badge>
          </button>
        ))}
      </div>

      {selectedEquipment.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            {selectedEquipment.length} equipment selected
            {reportType === 'single' && ' (Single mode)'}
            {reportType === 'multiple' && ' (Multiple mode)'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EquipmentReportGenerator; 