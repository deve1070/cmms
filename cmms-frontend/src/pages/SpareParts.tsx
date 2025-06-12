import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sparePartsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PencilIcon,
  XMarkIcon,
  FunnelIcon, // Already present, for general filter indication
  ArrowUpIcon, // For sort direction
  ArrowDownIcon, // For sort direction
} from '@heroicons/react/24/outline';

interface SparePart {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  category: string;
  unitCost: number;
  supplier?: string | null; // Made optional as per typical usage
  location: string;
  minOrderQty: number;
  leadTime: number;
  lastUpdated: string;
  alert?: string | null;    // Added
  equipmentId: string;     // Added
  // TODO: Consider adding equipment?: { id: string; modelNumber?: string; ... } for display
}

const initialNewPartData = {
  name: '',
  quantity: 0,
  threshold: 0,
  category: '',
  unitCost: 0,
  supplier: '',
  location: '',
  minOrderQty: 1,
  leadTime: 0,
  equipmentId: '',
};

const SpareParts: React.FC = () => {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // New filter states
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAlertStatus, setFilterAlertStatus] = useState('all');

  // Sorting states
  const [sortField, setSortField] = useState<keyof SparePart | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPartData, setNewPartData] = useState<Omit<SparePart, 'id' | 'lastUpdated' | 'alert'>>(initialNewPartData);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPartForUpdate, setSelectedPartForUpdate] = useState<SparePart | null>(null);

  // For handling update form changes separately
  const [updateFormData, setUpdateFormData] = useState<Partial<SparePart>>({});


  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    setLoading(true); // Ensure loading is true at the start of fetch
    try {
      const data = await sparePartsApi.getAll();
      setParts(data as SparePart[]);
    } catch (error) {
      toast.error('Failed to fetch spare parts');
      setParts([]); // Set to empty array on error to avoid issues with map
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, formType: 'new' | 'update') => {
    const { name, value } = e.target;
    const parsedValue = (name === 'quantity' || name === 'threshold' || name === 'unitCost' || name === 'minOrderQty' || name === 'leadTime')
                      ? parseFloat(value) || 0
                      : value;
    if (formType === 'new') {
      setNewPartData(prev => ({ ...prev, [name]: parsedValue }));
    } else if (formType === 'update' && selectedPartForUpdate) {
      setUpdateFormData(prev => ({ ...prev, [name]: parsedValue }));
    }
  };

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartData.equipmentId) {
      toast.error('Equipment ID is required.');
      return;
    }
    try {
      await sparePartsApi.create(newPartData);
      toast.success('Spare part added successfully!');
      fetchParts();
      setIsAddModalOpen(false);
      setNewPartData(initialNewPartData); // Reset form
    } catch (error) {
      console.error("Error creating part:", error);
      toast.error('Failed to add spare part.');
    }
  };

  const handleUpdatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartForUpdate) return;
    try {
      await sparePartsApi.update(selectedPartForUpdate.id, updateFormData);
      toast.success('Spare part updated successfully!');
      fetchParts();
      setIsUpdateModalOpen(false);
      setSelectedPartForUpdate(null);
      setUpdateFormData({});
    } catch (error) {
      console.error("Error updating part:", error);
      toast.error('Failed to update spare part.');
    }
  };

  const openUpdateModal = (part: SparePart) => {
    setSelectedPartForUpdate(part);
    setUpdateFormData({ // Initialize form data for update
      name: part.name,
      quantity: part.quantity,
      threshold: part.threshold,
      category: part.category,
      unitCost: part.unitCost,
      supplier: part.supplier,
      location: part.location,
      minOrderQty: part.minOrderQty,
      leadTime: part.leadTime,
      equipmentId: part.equipmentId,
    });
    setIsUpdateModalOpen(true);
  };

  const uniqueCategories = React.useMemo(() => {
    const categories = new Set(parts.map(part => part.category));
    return ['all', ...Array.from(categories)];
  }, [parts]);

  const filteredParts = React.useMemo(() => {
    return parts.filter(part => {
      const searchMatch =
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.equipmentId && part.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()));

      const categoryMatch = filterCategory === 'all' || part.category === filterCategory;

      let alertMatch = true;
      if (filterAlertStatus === 'lowStockOrAlert') {
        alertMatch = !!part.alert || part.quantity <= part.threshold;
      } else if (filterAlertStatus === 'noAlert') {
        alertMatch = !part.alert && part.quantity > part.threshold;
      }

      return searchMatch && categoryMatch && alertMatch;
    });
  }, [parts, searchTerm, filterCategory, filterAlertStatus]);

  const sortedAndFilteredParts = React.useMemo(() => {
    let sortedItems = [...filteredParts];
    if (sortField) {
      sortedItems.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;

        let comparison = 0;
        if (sortField === 'lastUpdated' || sortField === 'equipmentId') { // equipmentId might be numeric/string, handle as string for now
           comparison = new Date(valA as string).getTime() - new Date(valB as string).getTime();
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    return sortedItems;
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Spare Parts Inventory</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchParts()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
          {(user?.role === 'Admin' || user?.role === 'BiomedicalEngineer') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Part
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="searchParts" className="block text-sm font-medium text-gray-700">Search</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="searchParts"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Name, category, location, Eq. ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterAlertStatus" className="block text-sm font-medium text-gray-700">Stock Alert Status</label>
            <select
              id="filterAlertStatus"
              value={filterAlertStatus}
              onChange={(e) => setFilterAlertStatus(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All</option>
              <option value="lowStockOrAlert">Low Stock / Alerted</option>
              <option value="noAlert">Normal Stock</option>
            </select>
          </div>
           <div className="flex items-end space-x-2">
            <div>
              <label htmlFor="sortField" className="block text-sm font-medium text-gray-700">Sort By</label>
              <select
                id="sortField"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as keyof SparePart | '')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">None</option>
                <option value="name">Name</option>
                <option value="quantity">Quantity</option>
                <option value="category">Category</option>
                <option value="unitCost">Unit Cost</option>
                <option value="lastUpdated">Last Updated</option>
              </select>
            </div>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
              aria-label="Toggle sort direction"
            >
              {sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 text-gray-600" /> : <ArrowDownIcon className="h-5 w-5 text-gray-600" />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {sortedAndFilteredParts.map((part) => (
            <li key={part.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CubeIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {part.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Category: {part.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatus(part.quantity, part.threshold)}`}>
                      Stock: {part.quantity}
                    </span>
                    {(part.alert || part.quantity <= part.threshold) && (
                      <div className={`flex items-center text-sm ml-3 ${part.alert ? 'text-red-600' : 'text-yellow-600'}`}>
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {part.alert ? part.alert : 'Low Stock'}
                      </div>
                    )}
                  </div>
                  {(user?.role === 'Admin' || user?.role === 'BiomedicalEngineer' || user?.role === 'MaintenanceTechnician') && (
                    <button
                      onClick={() => openUpdateModal(part)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" /> Update
                    </button>
                  )}
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">Location: {part.location}</p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">Supplier: {part.supplier || 'N/A'}</p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    Unit Cost: ${part.unitCost?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Min Order: {part.minOrderQty} | Lead Time: {part.leadTime} days | Equipment ID: {part.equipmentId}</p>
                  <p>Last Updated: {part.lastUpdated ? new Date(part.lastUpdated).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SpareParts; 