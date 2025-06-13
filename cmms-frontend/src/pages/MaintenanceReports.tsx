import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import { MaintenanceReport } from '../types/maintenance';
import { maintenanceApi } from '../services/api';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const MaintenanceReports: React.FC = () => {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'preventive' | 'corrective'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching maintenance reports...');
        const data = await maintenanceApi.getAll();
        console.log('Received maintenance reports:', data);
        setReports(data);
      } catch (error) {
        console.error('Error fetching maintenance reports:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch maintenance reports');
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

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (reports.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">No maintenance reports found.</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Maintenance Reports
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Equipment</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Performed By</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                <TableCell>{report.equipment?.name || 'Unknown'}</TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>{report.status}</TableCell>
                <TableCell>{report.performedBy}</TableCell>
                <TableCell>{report.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MaintenanceReports; 