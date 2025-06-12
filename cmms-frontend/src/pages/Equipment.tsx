import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  BeakerIcon,
  WrenchIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
  PrinterIcon, // Added for Print button
  // Assuming Permission enum is not directly available here, using string permissions
  // If available, you would import: import { Permission } from '../../../../cmms-backend/src/config/permissions'; // Adjust path as needed
} from '@heroicons/react/24/outline';

// Updated Equipment interface based on Prisma schema
interface Equipment {
  id: string;
  serialNumber: string;
  manufacturerName: string;
  modelNumber: string;
  manufacturerServiceNumber?: string | null; // Optional fields
  vendorName?: string | null;
  vendorCode?: string | null;
  locationDescription: string;
  locationCode?: string | null;
  purchasePrice: number;
  installationDate: string; // Should be ISO date string
  warrantyExpirationDate: string; // Should be ISO date string
  status: 'Operational' | 'Needs Maintenance' | 'Out of Service' | 'Decommissioned'; // More specific status
  category: string;
  department: string;
  lastMaintenance?: string | null; // Optional, likely set by backend
  createdAt?: string; // Set by backend
  updatedAt?: string; // Set by backend
}

// Helper function to check permissions
const hasEquipmentManagementPermission = (user: any): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes('MANAGE_EQUIPMENT_FULL') || user.permissions.includes('MANAGE_EQUIPMENT');
};

interface EquipmentPageProps {
  action?: 'new' | 'edit';
  equipmentId?: string;
}

const EquipmentPage: React.FC<EquipmentPageProps> = ({ action, equipmentId }) => {
  const { user } = useAuth();
  // const navigate = useNavigate(); // Not used currently, but might be needed for redirecting after action
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // New state for maintenance history
  interface MaintenanceHistoryItem {
    id: string;
    type: string;
    description: string;
    performedBy: string;
    date: string;
    cost?: number;
    partsUsed?: string;
  }
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const navigate = useNavigate(); // Added for programmatic navigation if needed, e.g. after closing modal.

  const fetchEquipmentList = async () => {
    try {
      setLoadingList(true);
      const data = await equipmentApi.getAll();
      setEquipmentList(data as Equipment[]);
      setListError(null);
    } catch (err) {
      setListError('Failed to fetch equipment list');
      console.error('Error fetching equipment list:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchAndSetSelectedEquipment = async (id: string) => {
    try {
      setModalLoading(true);
      setListError(null);
      const equipmentData = await equipmentApi.getById(id);
      setSelectedEquipment(equipmentData as Equipment);
      setIsModalOpen(true); // Open modal once equipment is fetched

      // Fetch maintenance history if viewing an existing equipment
      setHistoryLoading(true);
      try {
        const historyData = await equipmentApi.getMaintenanceHistory(id);
        setMaintenanceHistory(historyData || []);
      } catch (historyErr) {
        console.error('Error fetching maintenance history:', historyErr);
        toast.error('Failed to load maintenance history.');
        setMaintenanceHistory([]);
      } finally {
        setHistoryLoading(false);
      }

    } catch (err) {
      setSelectedEquipment(null);
      toast.error('Failed to fetch equipment details for editing.');
      console.error(`Error fetching equipment with id ${id}:`, err);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentList();

    if (action === 'new') {
      setSelectedEquipment(null);
      setMaintenanceHistory([]); // Clear history for new item
      setIsModalOpen(true);
    } else if (action === 'edit' && equipmentId) {
      fetchAndSetSelectedEquipment(equipmentId);
    } else {
      // If no action, or action is not 'new'/'edit', ensure modal is closed and selectedEquipment is cleared
      // This is important if navigating to the base /equipment route
      setIsModalOpen(false);
      setSelectedEquipment(null);
      setMaintenanceHistory([]);
    }
  }, [action, equipmentId]);

  // Renamed `equipment` to `equipmentList` in map function
  // const fetchEquipment = async () => { // Original function, now part of fetchEquipmentList
  //   try {
  //     setLoading(true);
  //     const data = await equipmentApi.getAll();
  //     setEquipment(data as Equipment[]);
  //     setError(null);
  //   } catch (err) {
  //     setError('Failed to fetch equipment');
  //     console.error('Error fetching equipment:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleCreate = async (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'lastMaintenance'>) => {
    try {
      setModalLoading(true); // Set modal loading during operation
      const payload = {
        ...data,
        purchasePrice: Number(data.purchasePrice),
        status: data.status || 'Operational',
      };
      await equipmentApi.create(payload);
      fetchEquipmentList(); // Refresh list
      setIsModalOpen(false);
      setSelectedEquipment(null);
      toast.success('Equipment created successfully!');
    } catch (err) {
      // setError('Failed to create equipment'); // Error handled by toast
      toast.error('Failed to create equipment.');
      console.error('Error creating equipment:', err);
    } finally {
      setModalLoading(false); // Clear modal loading
    }
  };

  const handleUpdate = async (id: string, data: Partial<Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'lastMaintenance'>>) => {
    try {
      setModalLoading(true); // Set modal loading during operation
      const payload = {
        ...data,
        ...(data.purchasePrice && { purchasePrice: Number(data.purchasePrice) }),
      };
      await equipmentApi.update(id, payload);
      fetchEquipmentList(); // Refresh list
      setSelectedEquipment(null);
      setIsModalOpen(false);
      toast.success('Equipment updated successfully!');
    } catch (err) {
      // setError('Failed to update equipment'); // Error handled by toast
      toast.error('Failed to update equipment.');
      console.error('Error updating equipment:', err);
    } finally {
      setModalLoading(false); // Clear modal loading
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
      return;
    }
    try {
      setLoadingList(true); // Indicate loading for the list during delete op
      await equipmentApi.delete(id);
      fetchEquipmentList(); // Refresh list
      toast.success('Equipment deleted successfully!');
    } catch (err) {
      // setError('Failed to delete equipment'); // Error handled by toast
      toast.error('Failed to delete equipment.');
      console.error('Error deleting equipment:', err);
    } finally {
      setLoadingList(false); // Clear loading for the list
    }
  };

  if (loadingList) { // Changed to loadingList
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-section, .printable-section * {
            visibility: visible;
          }
          .printable-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px; /* Add some padding for print */
            border: none; /* Remove borders for print */
            box-shadow: none; /* Remove shadows for print */
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          thead {
            background-color: #f2f2f2;
          }
        }
      `}</style>
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 no-print">
        <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
        {hasEquipmentManagementPermission(user) && (
          <button
            onClick={() => { setSelectedEquipment(null); setMaintenanceHistory([]); setIsModalOpen(true); navigate('/equipment/new', { replace: true }); }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Equipment</span>
          </button>
        )}
      </div>

      {listError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 no-print">
          {listError}
        </div>
      )}

      {/* Equipment List Display */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${selectedEquipment ? 'no-print' : ''}`}>
        {equipmentList.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 no-print" // Individual cards also no-print if details are shown
          >
            <h2 className="text-xl font-semibold mb-2">{item.manufacturerName} {item.modelNumber}</h2>
            <p className="text-gray-600 mb-1">S/N: {item.serialNumber}</p>
            <p className="text-gray-600 mb-1">Location: {item.locationDescription} {item.locationCode && `(${item.locationCode})`}</p>
            <p className="text-gray-600 mb-1">Category: {item.category}</p>
            <p className="text-gray-600 mb-1">Department: {item.department}</p>
            <p className="text-gray-600 mb-1">Status:
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                item.status === 'Operational' ? 'bg-green-100 text-green-800' :
                item.status === 'Needs Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                item.status === 'Out of Service' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.status}
              </span>
            </p>
            <p className="text-gray-600 mb-1">Install Date: {new Date(item.installationDate).toLocaleDateString()}</p>
            <p className="text-gray-600 mb-4">Warranty Ends: {new Date(item.warrantyExpirationDate).toLocaleDateString()}</p>

            {hasEquipmentManagementPermission(user) && (
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => { navigate(`/equipment/edit/${item.id}`, { replace: true }); }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                >
                  Edit/View Details
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal - This is conditionally rendered by isModalOpen */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center no-print z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {selectedEquipment ? 'Edit Equipment' : 'Add Equipment'}
              </h2>
              <button onClick={() => { setIsModalOpen(false); setSelectedEquipment(null); setMaintenanceHistory([]); navigate('/equipment', { replace: true }); }} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form // Form content remains largely the same as previous version, focusing on modal structure here
              onSubmit={(e) => {
                e.preventDefault();
                // ... (form submission logic from previous step)
                const formData = new FormData(e.currentTarget);
                const data = {
                  serialNumber: formData.get('serialNumber') as string,
                  manufacturerName: formData.get('manufacturerName') as string,
                  modelNumber: formData.get('modelNumber') as string,
                  manufacturerServiceNumber: formData.get('manufacturerServiceNumber') as string || null,
                  vendorName: formData.get('vendorName') as string || null,
                  vendorCode: formData.get('vendorCode') as string || null,
                  locationDescription: formData.get('locationDescription') as string,
                  locationCode: formData.get('locationCode') as string || null,
                  purchasePrice: parseFloat(formData.get('purchasePrice') as string),
                  installationDate: new Date(formData.get('installationDate') as string).toISOString(),
                  warrantyExpirationDate: new Date(formData.get('warrantyExpirationDate') as string).toISOString(),
                  status: formData.get('status') as Equipment['status'],
                  category: formData.get('category') as string,
                  department: formData.get('department') as string,
                };

                if (selectedEquipment) {
                  handleUpdate(selectedEquipment.id, data);
                } else {
                  // Ensure all required fields for creation are present, others can be optional or defaulted in backend
                  handleCreate(data as Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'lastMaintenance'>);
                }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1"> {/* Added scroll for modal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Serial Number*</label>
                  <input type="text" name="serialNumber" defaultValue={selectedEquipment?.serialNumber} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Manufacturer Name*</label>
                  <input type="text" name="manufacturerName" defaultValue={selectedEquipment?.manufacturerName} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model Number*</label>
                  <input type="text" name="modelNumber" defaultValue={selectedEquipment?.modelNumber} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Manuf. Service Number</label>
                  <input type="text" name="manufacturerServiceNumber" defaultValue={selectedEquipment?.manufacturerServiceNumber || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
                  <input type="text" name="vendorName" defaultValue={selectedEquipment?.vendorName || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor Code</label>
                  <input type="text" name="vendorCode" defaultValue={selectedEquipment?.vendorCode || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location Description*</label>
                  <input type="text" name="locationDescription" defaultValue={selectedEquipment?.locationDescription} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location Code</label>
                  <input type="text" name="locationCode" defaultValue={selectedEquipment?.locationCode || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Price*</label>
                  <input type="number" name="purchasePrice" step="0.01" defaultValue={selectedEquipment?.purchasePrice} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Installation Date*</label>
                  <input type="date" name="installationDate" defaultValue={selectedEquipment?.installationDate ? new Date(selectedEquipment.installationDate).toISOString().split('T')[0] : ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Warranty Expiration*</label>
                  <input type="date" name="warrantyExpirationDate" defaultValue={selectedEquipment?.warrantyExpirationDate ? new Date(selectedEquipment.warrantyExpirationDate).toISOString().split('T')[0] : ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700">Status*</label>
                  <select name="status" defaultValue={selectedEquipment?.status || 'Operational'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                    <option value="Operational">Operational</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category*</label>
                  <input type="text" name="category" defaultValue={selectedEquipment?.category} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department*</label>
                  <input type="text" name="department" defaultValue={selectedEquipment?.department} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">* Required fields</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedEquipment(null);
                    setMaintenanceHistory([]); // Clear history when closing modal
                    navigate('/equipment', { replace: true }); // Navigate back to base equipment page
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${modalLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {modalLoading ? 'Saving...' : (selectedEquipment ? 'Update Equipment' : 'Create Equipment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance History Section - Only shown when viewing/editing an existing equipment and modal is NOT open for that equipment (or modal is part of this view) */}
      {/* For this iteration, history is shown if selectedEquipment is loaded, regardless of modal state if modal is for THIS item */}
      {selectedEquipment && !isModalOpen && ( // Show history if an item is selected AND modal is not open (or modal is the main view)
         <div className="mt-12 printable-section">
          <div className="flex justify-between items-center mb-6 no-print">
            <h2 className="text-2xl font-bold text-gray-900">Maintenance History for {selectedEquipment.manufacturerName} {selectedEquipment.modelNumber} (S/N: {selectedEquipment.serialNumber})</h2>
            <button
              onClick={() => window.print()}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <PrinterIcon className="h-5 w-5" />
              <span>Print History</span>
            </button>
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : maintenanceHistory.length === 0 ? (
            <p className="text-gray-600">No maintenance history found for this equipment.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parts Used</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {maintenanceHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.performedBy}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.partsUsed || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.cost ? `$${item.cost.toFixed(2)}` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default EquipmentPage;