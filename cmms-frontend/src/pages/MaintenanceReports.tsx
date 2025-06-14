import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { maintenanceApi } from '../services/api';
import { toast } from 'react-hot-toast';
import type { MaintenanceReport } from '../types/maintenance';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const MaintenanceReports: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<string>('6months');
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await maintenanceApi.getAll({
        timeRange,
      });
      setReports(data);
    } catch (error) {
      toast.error('Failed to load maintenance reports');
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthlyStats = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const stats = months.map(month => ({
      month,
      completed: 0,
      pending: 0,
    }));

    reports.forEach(report => {
      const date = new Date(report.createdAt);
      const monthIndex = date.getMonth();
      if (report.status === 'Completed') {
        stats[monthIndex].completed++;
      } else {
        stats[monthIndex].pending++;
      }
    });

    return stats;
  };

  const getEquipmentStats = () => {
    const equipmentMap = new Map<string, number>();
    
    reports.forEach(report => {
      const count = equipmentMap.get(report.equipment.name) || 0;
      equipmentMap.set(report.equipment.name, count + 1);
    });

    return Array.from(equipmentMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const getSummary = () => {
    const totalWorkOrders = reports.length;
    const completedWorkOrders = reports.filter(r => r.status === 'Completed').length;
    const averageResponseTime = calculateAverageResponseTime();
    const onTimeCompletion = calculateOnTimeCompletion();

    return {
      totalWorkOrders,
      completedWorkOrders,
      averageResponseTime,
      onTimeCompletion,
    };
  };

  const calculateAverageResponseTime = () => {
    const completedReports = reports.filter(r => r.status === 'Completed');
    if (completedReports.length === 0) return '0 days';

    const totalDays = completedReports.reduce((sum, report) => {
      const startDate = new Date(report.createdAt);
      const endDate = new Date(report.updatedAt);
      const days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    const averageDays = totalDays / completedReports.length;
    return `${averageDays.toFixed(1)} days`;
  };

  const calculateOnTimeCompletion = () => {
    const completedReports = reports.filter(r => r.status === 'Completed');
    if (completedReports.length === 0) return '0%';

    const onTimeReports = completedReports.filter(report => {
      if (!report.nextDueDate) return true;
      const completionDate = new Date(report.updatedAt);
      const dueDate = new Date(report.nextDueDate);
      return completionDate <= dueDate;
    });

    const percentage = (onTimeReports.length / completedReports.length) * 100;
    return `${percentage.toFixed(0)}%`;
  };

  const handleExport = async () => {
    try {
      const blob = await maintenanceApi.exportReports({ timeRange });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maintenance-reports-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to export reports');
    }
  };

  const summary = getSummary();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Maintenance Reports</h1>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>Export Report</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalWorkOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.completedWorkOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageResponseTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.onTimeCompletion}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getMonthlyStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#4f46e5" name="Completed" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Orders by Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getEquipmentStats()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getEquipmentStats().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceReports; 