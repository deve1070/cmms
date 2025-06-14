import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sparePartsApi, workOrdersApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  X,
  Filter,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { SparePart } from '../types/sparePart';
import type { WorkOrder } from '../types/workOrder';
import type { FrontendUserRole } from '../types/auth';
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

// Extended type for the form data
interface SparePartFormData extends Omit<SparePart, 'id' | 'lastUpdated'> {
  minOrderQty: number;
  leadTime: number;
  equipmentId?: string;
  alert?: string;
}

const initialNewPartData: SparePartFormData = {
  name: '',
  quantity: 0,
  minimumQuantity: 0,
  unit: 'pcs',
  location: '',
  category: '',
  supplier: '',
  unitCost: 0,
  notes: '',
  minOrderQty: 1,
  leadTime: 0,
};

const SpareParts: React.FC = () => {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // New filter states
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAlertStatus, setFilterAlertStatus] = useState('all');

  // Sorting states
  const [sortField, setSortField] = useState<keyof SparePart | 'lastUpdated'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPartData, setNewPartData] = useState<SparePartFormData>(initialNewPartData);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPartForUpdate, setSelectedPartForUpdate] = useState<SparePart | null>(null);

  // For handling update form changes separately
  const [updateFormData, setUpdateFormData] = useState<Partial<SparePartFormData>>({});

  const [isLogUsageModalOpen, setIsLogUsageModalOpen] = useState(false);
  const [logUsagePart, setLogUsagePart] = useState<SparePart | null>(null);
  const [logUsageWorkOrderId, setLogUsageWorkOrderId] = useState('');
  const [logUsageQuantity, setLogUsageQuantity] = useState(1);
  const [logUsageLoading, setLogUsageLoading] = useState(false);

  const validateForm = () => {
    if (!newPartData.name || !newPartData.location) {
      toast.error('Name and location are required');
      return false;
    }
    if (newPartData.quantity < 0 || newPartData.minimumQuantity < 0) {
      toast.error('Quantity and minimum quantity must be non-negative');
      return false;
    }
    return true;
  };

  const validateUpdateForm = () => {
    if (!updateFormData.name || !updateFormData.location) {
      toast.error('Name and location are required');
      return false;
    }
    if (updateFormData.quantity !== undefined && updateFormData.quantity < 0) {
      toast.error('Quantity must be non-negative');
      return false;
    }
    if (updateFormData.minimumQuantity !== undefined && updateFormData.minimumQuantity < 0) {
      toast.error('Minimum quantity must be non-negative');
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetchParts();
    fetchWorkOrders();
  }, []);

  const fetchParts = async () => {
    setLoading(true);
    try {
      const data = await sparePartsApi.getAll();
      setParts(data as SparePart[]);
    } catch (error) {
      toast.error('Failed to fetch spare parts');
      setParts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const data = await workOrdersApi.getAll();
      setWorkOrders(data);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      toast.error('Failed to fetch work orders');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    formType: 'new' | 'update'
  ) => {
    const { name, value } = e.target;
    const parsedValue =
      name === 'quantity' || name === 'minimumQuantity' || name === 'unitCost'
        ? parseFloat(value) || 0
        : value;
    if (formType === 'new') {
      setNewPartData((prev) => ({ ...prev, [name]: parsedValue }));
    } else if (formType === 'update' && selectedPartForUpdate) {
      setUpdateFormData((prev) => ({ ...prev, [name]: parsedValue }));
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const partData = {
        name: newPartData.name,
        quantity: newPartData.quantity,
        threshold: newPartData.minimumQuantity,
        category: newPartData.category || '',
        unitCost: newPartData.unitCost || 0,
        supplier: newPartData.supplier || undefined,
        location: newPartData.location,
        minOrderQty: newPartData.minOrderQty,
        leadTime: newPartData.leadTime,
      };
      await sparePartsApi.create(partData);
      toast.success('Spare part added successfully!');
      fetchParts();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding spare part:', error);
      toast.error('Failed to add spare part.');
    }
  };

  const handleUpdatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUpdateForm()) return;
    if (!selectedPartForUpdate) return;

    try {
      const updateData = {
        name: updateFormData.name,
        quantity: updateFormData.quantity,
        threshold: updateFormData.minimumQuantity,
        category: updateFormData.category,
        unitCost: updateFormData.unitCost,
        supplier: updateFormData.supplier,
        location: updateFormData.location,
        minOrderQty: updateFormData.minOrderQty,
        leadTime: updateFormData.leadTime,
      };
      await sparePartsApi.update(selectedPartForUpdate.id, updateData);
      toast.success('Spare part updated successfully!');
      fetchParts();
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error('Error updating spare part:', error);
      toast.error('Failed to update spare part.');
    }
  };

  const openUpdateModal = (part: SparePart) => {
    setSelectedPartForUpdate(part);
    setUpdateFormData({
      name: part.name,
      quantity: part.quantity,
      minimumQuantity: part.minimumQuantity,
      unit: part.unit,
      location: part.location,
      category: part.category,
      supplier: part.supplier,
      unitCost: part.unitCost,
      notes: part.notes,
      minOrderQty: (part as any).minOrderQty || 1,
      leadTime: (part as any).leadTime || 0,
    });
    setIsUpdateModalOpen(true);
  };

  const openLogUsageModal = (part: SparePart) => {
    setLogUsagePart(part);
    setLogUsageWorkOrderId('');
    setLogUsageQuantity(1);
    setIsLogUsageModalOpen(true);
  };

  const handleLogUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logUsagePart || !logUsageWorkOrderId || logUsageQuantity <= 0) {
      toast.error('Please provide all required fields.');
      return;
    }

    if (logUsageQuantity > logUsagePart.quantity) {
      toast.error('Cannot use more parts than available in stock.');
      return;
    }

    setLogUsageLoading(true);
    try {
      const response = await workOrdersApi.logPartUsage(logUsageWorkOrderId, logUsagePart.id, logUsageQuantity);
      
      // Update the local state to reflect the new quantity
      setParts(prevParts => 
        prevParts.map(part => 
          part.id === logUsagePart.id 
            ? { ...part, quantity: part.quantity - logUsageQuantity }
            : part
        )
      );

      toast.success('Part usage logged successfully!');
      setIsLogUsageModalOpen(false);
      
      // Refresh the parts list to ensure we have the latest data
      await fetchParts();
    } catch (error: any) {
      console.error('Error logging part usage:', error);
      if (error.response?.status === 404) {
        toast.error('Work order not found. Please check the work order ID.');
      } else if (error.response?.status === 400) {
        toast.error('Not enough parts in stock.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        // Don't show error message for auth errors, let the interceptor handle it
        return;
      } else {
        toast.error('Failed to log part usage. Please try again.');
      }
    } finally {
      setLogUsageLoading(false);
    }
  };

  const uniqueCategories = React.useMemo(() => {
    // Filter out undefined categories and ensure all values are strings
    const categories = new Set(parts.map((part) => part.category || ''));
    return ['all', ...Array.from(categories)];
  }, [parts]);

  const filterParts = (parts: SparePart[]) => {
    return parts.filter((part) => {
      const searchMatch =
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.location.toLowerCase().includes(searchTerm.toLowerCase());

      const categoryMatch = filterCategory === 'all' || part.category === filterCategory;

      let alertMatch = true;
      if (filterAlertStatus === 'lowStockOrAlert') {
        alertMatch = part.quantity <= part.minimumQuantity;
      } else if (filterAlertStatus === 'noAlert') {
        alertMatch = part.quantity > part.minimumQuantity;
      }

      return searchMatch && categoryMatch && alertMatch;
    });
  };

  const sortData = (
    data: SparePart[],
    sortField: keyof SparePart | 'lastUpdated',
    sortDirection: 'asc' | 'desc'
  ) => {
    return [...data].sort((a, b) => {
      const valA = sortField === 'lastUpdated' ? a.lastUpdated : a[sortField as keyof SparePart];
      const valB = sortField === 'lastUpdated' ? b.lastUpdated : b[sortField as keyof SparePart];

      let comparison = 0;
      if (sortField === 'lastUpdated') {
        comparison = new Date(valA as string).getTime() - new Date(valB as string).getTime();
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const filteredParts = React.useMemo(() => {
    return filterParts(parts);
  }, [parts, searchTerm, filterCategory, filterAlertStatus]);

  const sortedAndFilteredParts = React.useMemo(() => {
    return sortData(filteredParts, sortField, sortDirection);
  }, [filteredParts, sortField, sortDirection]);

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity <= 0) return 'bg-red-100 text-red-800';
    if (quantity <= threshold) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Spare Parts Inventory</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add New Part</Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search parts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {uniqueCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat || 'Uncategorized'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <Select value={filterAlertStatus} onValueChange={setFilterAlertStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by stock alert status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="lowStockOrAlert">Low Stock / Alerted</SelectItem>
            <SelectItem value="noAlert">Normal Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortField}
          onValueChange={(value) => setSortField(value as keyof SparePart | 'lastUpdated')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="quantity">Quantity</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="unitCost">Unit Cost</SelectItem>
            <SelectItem value="lastUpdated">Last Updated</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
          aria-label="Toggle sort direction"
        >
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ArrowDown className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Min Quantity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Restocked</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredParts.map((part) => (
              <TableRow key={part.id}>
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.category || 'Uncategorized'}</TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${
                      part.quantity <= part.minimumQuantity ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {part.quantity}
                  </span>
                </TableCell>
                <TableCell>{part.minimumQuantity}</TableCell>
                <TableCell>{part.location}</TableCell>
                <TableCell>
                  {part.lastUpdated ? new Date(part.lastUpdated).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>{part.supplier || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {(user?.role === 'admin' ||
                      user?.role === 'engineer for maintenance' ||
                      user?.role === 'laboratory technician') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateModal(part)}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openLogUsageModal(part)}
                    >
                      Log Usage
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Log Usage Modal */}
      {isLogUsageModalOpen && logUsagePart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Log Part Usage</h2>
            <form onSubmit={handleLogUsage}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Part</label>
                <div className="font-semibold">{logUsagePart.name}</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Order
                </label>
                <Select
                  value={logUsageWorkOrderId}
                  onValueChange={setLogUsageWorkOrderId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a work order" />
                  </SelectTrigger>
                  <SelectContent>
                    {workOrders.map((wo) => (
                      <SelectItem key={wo.id} value={wo.id}>
                        {wo.issue} ({wo.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Used
                </label>
                <input
                  type="number"
                  min={1}
                  max={logUsagePart.quantity}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={logUsageQuantity}
                  onChange={(e) => setLogUsageQuantity(Number(e.target.value))}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setIsLogUsageModalOpen(false)}
                  disabled={logUsageLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  disabled={logUsageLoading}
                >
                  {logUsageLoading ? 'Logging...' : 'Log Usage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpareParts;