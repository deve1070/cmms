import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { contractsApi } from '../services/api'; // Ensure this path is correct
import { toast } from 'react-hot-toast';
import {
  DocumentTextIcon, ExclamationTriangleIcon, PlusIcon, ArrowPathIcon,
  PencilIcon, TrashIcon, XMarkIcon, FunnelIcon,
  ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon, BellAlertIcon
} from '@heroicons/react/24/outline';

// Interfaces
interface EquipmentLite {
  id: string;
  modelNumber?: string;
  serialNumber?: string;
  manufacturerName?: string;
}

interface Contract {
  id: string;
  vendor: string;
  equipmentId: string;
  equipment?: EquipmentLite; // Populated by include from backend
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  details: string;
  status: 'Active' | 'Expired' | 'Pending Renewal' | 'Cancelled';
  renewalReminderDate?: string | null; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

type ContractFormData = Partial<Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'equipment'>> & {
  // Fields that are strings in form but might be Date on backend are handled during submission
  startDate: string; // yyyy-MM-dd for input
  endDate: string;   // yyyy-MM-dd for input
  renewalReminderDate?: string; // yyyy-MM-dd for input
};

const initialFormData: ContractFormData = {
  vendor: '',
  equipmentId: '', // TODO: Change to null or specific handling if using a select dropdown
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Default to 1 year
  renewalReminderDate: '',
  details: '',
  status: 'Active',
};

const ContractStatusOptions: Contract['status'][] = ['Active', 'Pending Renewal', 'Expired', 'Cancelled'];


const ContractsList: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<ContractFormData>(initialFormData);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  // Filters and Sorting
  const [filterStatus, setFilterStatus] = useState<Contract['status'] | 'all'>('all');
  const [sortField, setSortField] = useState<keyof Contract | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isUpdatingStatuses, setIsUpdatingStatuses] = useState(false);


  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contractsApi.getAll();
      setContracts(data as Contract[]);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError('Failed to load contracts.');
      toast.error('Failed to load contracts.');
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleOpenModal = (mode: 'add' | 'edit', contract: Contract | null = null) => {
    setModalMode(mode);
    setSelectedContract(contract);
    if (mode === 'add' || !contract) {
      setFormData(initialFormData);
    } else {
      setFormData({
        vendor: contract.vendor,
        equipmentId: contract.equipmentId,
        startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
        endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
        renewalReminderDate: contract.renewalReminderDate ? new Date(contract.renewalReminderDate).toISOString().split('T')[0] : '',
        details: contract.details,
        status: contract.status,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContract(null);
    setFormData(initialFormData);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingModal(true);

    const payload: any = { ...formData };
    // Ensure dates are sent in ISO format if they are not empty, otherwise null/undefined
    payload.startDate = formData.startDate ? new Date(formData.startDate).toISOString() : null;
    payload.endDate = formData.endDate ? new Date(formData.endDate).toISOString() : null;
    payload.renewalReminderDate = formData.renewalReminderDate ? new Date(formData.renewalReminderDate).toISOString() : null;

    if (!payload.equipmentId) { // Basic validation
        toast.error("Equipment ID is required.");
        setIsSubmittingModal(false);
        return;
    }


    try {
      if (modalMode === 'add') {
        await contractsApi.create(payload);
        toast.success('Contract created successfully!');
      } else if (selectedContract) {
        await contractsApi.update(selectedContract.id, payload);
        toast.success('Contract updated successfully!');
      }
      fetchContracts();
      handleCloseModal();
    } catch (err: any) {
      console.error(`Error ${modalMode}ing contract:`, err);
      toast.error(err.response?.data?.error || `Failed to ${modalMode} contract.`);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await contractsApi.delete(contractId);
        toast.success('Contract deleted successfully!');
        fetchContracts();
      } catch (err: any) {
        console.error('Error deleting contract:', err);
        toast.error(err.response?.data?.error || 'Failed to delete contract.');
      }
    }
  };

  const handleUpdateExpiringStatuses = async () => {
    setIsUpdatingStatuses(true);
    try {
      const response = await contractsApi.updateExpiringStatuses();
      toast.success(response.message || "Updated expiring contract statuses.");
      if(response.updatedCount > 0) fetchContracts(); // Refresh if changes were made
    } catch (err: any) {
      console.error('Error updating expiring statuses:', err);
      toast.error(err.response?.data?.error || 'Failed to update expiring statuses.');
    } finally {
      setIsUpdatingStatuses(false);
    }
  };

  const handleLogVendorNotification = (contractId: string) => {
    // Mock API call for now as per instructions
    // In a real scenario: await contractsApi.logNotification(contractId);
    toast.success(`Vendor notification logged for contract ID: ${contractId}`);
  };


  const filteredContracts = useMemo(() => {
    return contracts.filter(c => filterStatus === 'all' || c.status === filterStatus);
  }, [contracts, filterStatus]);

  const sortedAndFilteredContracts = useMemo(() => {
    let sortedItems = [...filteredContracts];
    if (sortField) {
      sortedItems.sort((a, b) => {
        const valA = a[sortField as keyof Contract]; // Type assertion
        const valB = b[sortField as keyof Contract];

        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;

        let comparison = 0;
        if (['startDate', 'endDate', 'renewalReminderDate', 'createdAt', 'updatedAt'].includes(sortField)) {
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
  }, [filteredContracts, sortField, sortDirection]);

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending Renewal': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const SortIndicator = ({ fieldName }: { fieldName: keyof Contract }) => {
    if (sortField !== fieldName) return <ChevronUpDownIcon className="h-4 w-4 text-gray-400 ml-1 inline-block" />;
    return sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 text-blue-600 ml-1 inline-block" /> : <ChevronDownIcon className="h-4 w-4 text-blue-600 ml-1 inline-block" />;
  };


  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="p-6 text-center text-red-600">{error} <button onClick={fetchContracts} className="text-blue-500">Try Again</button></div>;

  const isAdmin = user?.role === 'Admin';
  const isBME = user?.role === 'BiomedicalEngineer';


  return (
    <div className="p-4 md:p-6 max-w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <DocumentTextIcon className="h-7 w-7 mr-2 text-blue-600" />
          Contracts Management
        </h1>
        <div className="flex flex-wrap items-center space-x-0 md:space-x-3 gap-2">
          <button onClick={fetchContracts} disabled={isLoading} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
            <ArrowPathIcon className="h-5 w-5 mr-1" /> Refresh
          </button>
          {isAdmin && (
            <>
              <button onClick={handleUpdateExpiringStatuses} disabled={isUpdatingStatuses} className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50">
                <BellAlertIcon className="h-5 w-5 mr-1" /> {isUpdatingStatuses ? 'Updating...' : 'Update Expiring Statuses'}
              </button>
              <button onClick={() => handleOpenModal('add')} className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="h-5 w-5 mr-1" /> Add Contract
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters and Sorting UI */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700">Filter by Status</label>
            <select id="filterStatus" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Contract['status'] | 'all')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="all">All Statuses</option>
                {ContractStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        <div className="flex items-end space-x-2 col-span-1 lg:col-span-2"> {/* Adjusted span for larger screens */}
          <div className="flex-grow">
            <label htmlFor="sortField" className="block text-sm font-medium text-gray-700">Sort By</label>
            <select id="sortField" value={sortField} onChange={(e) => setSortField(e.target.value as keyof Contract | '')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="">None</option>
                <option value="vendor">Vendor</option>
                <option value="endDate">End Date</option>
                <option value="status">Status</option>
                <option value="renewalReminderDate">Reminder Date</option>
            </select>
          </div>
          <button onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 self-end mb-px" aria-label="Toggle sort direction">
              {sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 text-gray-600" /> : <ArrowDownIcon className="h-5 w-5 text-gray-600" />}
          </button>
        </div>
      </div>


      <div className="bg-white shadow-md overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal Reminder</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredContracts.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">No contracts found.</td></tr>
            ) : (
              sortedAndFilteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{contract.vendor}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {contract.equipment ? `${contract.equipment.manufacturerName || ''} ${contract.equipment.modelNumber || ''} (S/N: ${contract.equipment.serialNumber || 'N/A'})` : contract.equipmentId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(contract.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(contract.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{contract.renewalReminderDate ? new Date(contract.renewalReminderDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                    {isAdmin && (
                      <>
                        <button onClick={() => handleOpenModal('edit', contract)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5 inline-block" /></button>
                        <button onClick={() => handleDeleteContract(contract.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5 inline-block" /></button>
                      </>
                    )}
                    {isBME && !isAdmin && ( // BME can log notification if not also an Admin (to avoid duplicate buttons if roles overlap)
                       <button onClick={() => handleLogVendorNotification(contract.id)} title="Log Vendor Notification" className="text-green-600 hover:text-green-900"><BellAlertIcon className="h-5 w-5 inline-block" /></button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{modalMode === 'add' ? 'Add New Contract' : 'Edit Contract'}</h2>
              <button onClick={handleCloseModal}><XMarkIcon className="h-6 w-6 text-gray-600 hover:text-gray-800" /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">Vendor*</label>
                <input type="text" name="vendor" id="vendor" value={formData.vendor || ''} onChange={handleFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700">Equipment ID*</label>
                {/* TODO: Future: Replace with searchable equipment dropdown */}
                <input type="text" name="equipmentId" id="equipmentId" value={formData.equipmentId || ''} onChange={handleFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date*</label>
                  <input type="date" name="startDate" id="startDate" value={formData.startDate || ''} onChange={handleFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date*</label>
                  <input type="date" name="endDate" id="endDate" value={formData.endDate || ''} onChange={handleFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="renewalReminderDate" className="block text-sm font-medium text-gray-700">Renewal Reminder Date (Optional)</label>
                <input type="date" name="renewalReminderDate" id="renewalReminderDate" value={formData.renewalReminderDate || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status*</label>
                <select name="status" id="status" value={formData.status || 'Active'} onChange={handleFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  {ContractStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700">Details*</label>
                <textarea name="details" id="details" value={formData.details || ''} onChange={handleFormChange} required rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmittingModal} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {isSubmittingModal ? 'Saving...' : (modalMode === 'add' ? 'Create Contract' : 'Update Contract')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractsList;
