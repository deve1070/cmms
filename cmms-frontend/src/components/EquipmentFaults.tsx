import React, { useState, useEffect } from 'react';
import { workOrdersApi } from '../services/api';
import { WorkOrder } from '../types/workOrder';
import { toast } from 'react-hot-toast';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';

const EquipmentFaults: React.FC = () => {
  const [faults, setFaults] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchFaults();
  }, []);

  const fetchFaults = async () => {
    try {
      setIsLoading(true);
      const data = await workOrdersApi.getAll();
      // Filter work orders reported by lab technicians
      const labTechFaults = data.filter(wo => 
        wo.reportedBy.role === 'Lab Technician' && 
        wo.type === 'Corrective'
      );
      setFaults(labTechFaults);
    } catch (error) {
      console.error('Error fetching faults:', error);
      toast.error('Failed to load equipment faults');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (workOrderId: string, newStatus: WorkOrder['status']) => {
    try {
      await workOrdersApi.update(workOrderId, { status: newStatus });
      setFaults(prev => prev.map(wo => 
        wo.id === workOrderId ? { ...wo, status: newStatus } : wo
      ));
      toast.success('Work order status updated');
    } catch (error) {
      toast.error('Failed to update work order status');
    }
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const filteredFaults = faults.filter(wo => 
    statusFilter === 'all' || wo.status === statusFilter
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Equipment Faults Reported by Lab Technicians</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Reported">Reported</SelectItem>
            <SelectItem value="Assigned">Assigned</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFaults.map((fault) => (
              <TableRow key={fault.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{fault.equipment.name}</div>
                    <div className="text-sm text-gray-500">{fault.equipment.serialNumber}</div>
                  </div>
                </TableCell>
                <TableCell>{fault.issue}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{fault.reportedBy.username}</div>
                    <div className="text-sm text-gray-500">{fault.reportedBy.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(fault.priority)}>
                    {fault.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(fault.status)}>
                    {fault.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(fault.createdAt), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <Select
                    value={fault.status}
                    onValueChange={(value) => handleStatusChange(fault.id, value as WorkOrder['status'])}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reported">Reported</SelectItem>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EquipmentFaults; 