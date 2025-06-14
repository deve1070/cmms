import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workOrdersApi, sparePartsApi } from '../services/api';
import {
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { WorkOrder } from '../types/workOrder';
import { SparePart } from '../types/sparePart';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const WorkOrders: React.FC = () => {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  const [sortField, setSortField] = useState<keyof WorkOrder | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [selectedPart, setSelectedPart] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [workOrdersData, sparePartsData] = await Promise.all([
          workOrdersApi.getAll(),
          sparePartsApi.getAll()
        ]);
        setWorkOrders(workOrdersData);
        setSpareParts(sparePartsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogPartUsage = async (workOrderId: string) => {
    try {
      if (!selectedPart || partQuantity <= 0) {
        toast.error('Please select a part and enter a valid quantity');
        return;
      }

      await workOrdersApi.logPartUsage(workOrderId, selectedPart, partQuantity);
      
      // Update the work order in the list
      setWorkOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === workOrderId 
            ? {
                ...order,
                partsUsed: JSON.stringify([
                  ...JSON.parse(order.partsUsed || '[]'),
                  {
                    partId: selectedPart,
                    quantity: partQuantity
                  }
                ])
              }
            : order
        )
      );

      toast.success('Part usage logged successfully');
      setSelectedPart('');
      setPartQuantity(1);
      setSelectedWorkOrder(null);
    } catch (error) {
      console.error('Error logging part usage:', error);
      toast.error('Failed to log part usage');
    }
  };

  const filteredWorkOrders = workOrders.filter(item => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
      (item.description?.toLowerCase() || '').includes(searchString) ||
      (item.assignedTo?.username?.toLowerCase() || '').includes(searchString) ||
      (item.reportedBy?.username?.toLowerCase() || '').includes(searchString) ||
      (item.equipmentId?.toLowerCase() || '').includes(searchString) ||
      (item.type?.toLowerCase() || '').includes(searchString);

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    let matchesUnassigned = true;
    if (showUnassignedOnly) {
      matchesUnassigned = !item.assignedTo || item.assignedTo.username === 'unassigned' || item.assignedTo.username === '';
    }

    return matchesSearch && matchesStatus && matchesType && matchesUnassigned;
  });

  const sortedAndFilteredWorkOrders = React.useMemo(() => {
    let sortedItems = [...filteredWorkOrders];
    if (sortField) {
      sortedItems = sortData(sortedItems, sortField, sortDirection);
    }
    return sortedItems;
  }, [filteredWorkOrders, sortField, sortDirection]);

  const handleSort = (field: keyof WorkOrder) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIndicator = ({ fieldName }: { fieldName: keyof WorkOrder }) => {
    if (sortField !== fieldName) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400 ml-1 inline-block" />;
    }
    return sortDirection === 'asc' ?
      <ChevronUp className="h-4 w-4 text-blue-600 ml-1 inline-block" /> :
      <ChevronDown className="h-4 w-4 text-blue-600 ml-1 inline-block" />;
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Reported':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sortData = (data: WorkOrder[], sortKey: keyof WorkOrder, sortDirection: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      let comparison = 0;

      if (valA === null || valA === undefined) {
        comparison = 1;
      } else if (valB === null || valB === undefined) {
        comparison = -1;
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        if (sortKey === 'updatedAt' || sortKey === 'createdAt') {
          comparison = new Date(valA).getTime() - new Date(valB).getTime();
        } else {
          comparison = valA.localeCompare(valB);
        }
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <Button onClick={() => navigate('/biomedical/work-orders/new')}>
          Create Work Order
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search work orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="preventive">Preventive</SelectItem>
            <SelectItem value="corrective">Corrective</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell>{workOrder.id}</TableCell>
                <TableCell>{workOrder.equipment.name}</TableCell>
                <TableCell className="capitalize">{workOrder.type}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    workOrder.priority === 'High' ? 'bg-red-100 text-red-800' :
                    workOrder.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {workOrder.priority}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    workOrder.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    workOrder.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {workOrder.status}
                  </span>
                </TableCell>
                <TableCell>{workOrder.assignedTo?.username || 'Unassigned'}</TableCell>
                <TableCell>{new Date(workOrder.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/biomedical/work-orders/${workOrder.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Part Usage Modal */}
      {selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Log Part Usage</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Part</label>
                <select
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a part</option>
                  {spareParts.map(part => (
                    <option key={part.id} value={part.id}>
                      {part.name} (Available: {part.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={partQuantity}
                  onChange={(e) => setPartQuantity(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedWorkOrder(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleLogPartUsage(selectedWorkOrder.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Log Usage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrders;