import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { workOrdersApi, equipmentApi, sparePartsApi, usersApi } from '../services/api'; // Added usersApi
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, PencilIcon, ExclamationTriangleIcon, UserGroupIcon } from '@heroicons/react/24/outline'; // Added UserGroupIcon

// Interfaces (should ideally be in a shared types file)
interface Equipment {
  id: string;
  serialNumber: string;
  manufacturerName: string;
  modelNumber: string;
  // Add other relevant fields if needed for display
}

interface SparePart {
  id: string;
  name: string;
  quantity: number; // Available quantity
}

interface WorkOrder {
  id: string;
  equipmentId: string;
  issue: string;
  description?: string | null;
  type?: string | null;
  priority?: string | null;
  status: 'Pending' | 'Reported' | 'Assigned' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled'; // Adjusted status values
  reportedBy: string;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  reportedAt: string; // Assuming this exists from backend
  actions?: string | null;
  completionNotes?: string | null;
  sparePartsNeeded?: string | null; // JSON string
  partsUsed?: string | null;      // JSON string
  // Optional: add equipment object if API includes it directly
  equipment?: Equipment;
}

interface User { // Basic User interface for assignment
  id: string;
  username: string;
  role: string;
}

interface PartUsedInput {
  id: string;
  quantity: number;
}

const WorkOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [equipmentDetails, setEquipmentDetails] = useState<Equipment | null>(null);
  const [allSpareParts, setAllSpareParts] = useState<SparePart[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]); // State for assignable users

  // State for the update form
  const [statusForUpdate, setStatusForUpdate] = useState<WorkOrder['status'] | ''>('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [partsUsedForUpdate, setPartsUsedForUpdate] = useState<PartUsedInput[]>([]);
  const [assignedToForUpdate, setAssignedToForUpdate] = useState<string>(''); // State for selected assignee

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrderDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const woData = await workOrdersApi.getById(id) as WorkOrder;
      setWorkOrder(woData);
      setStatusForUpdate(woData.status || '');
      setActionsTaken(woData.actions || '');
      setCompletionNotes(woData.completionNotes || '');
      setAssignedToForUpdate(woData.assignedTo || ''); // Initialize assignedToForUpdate

      if (woData.partsUsed) {
        try {
          setPartsUsedForUpdate(JSON.parse(woData.partsUsed));
        } catch (e) {
          console.error("Error parsing partsUsed JSON:", e);
          setPartsUsedForUpdate([]);
        }
      } else {
        setPartsUsedForUpdate([]);
      }

      if (woData.equipmentId) {
        const eqData = await equipmentApi.getById(woData.equipmentId) as Equipment;
        setEquipmentDetails(eqData);
      }
    } catch (err) {
      console.error('Error fetching work order details:', err);
      setError('Failed to load work order details.');
      toast.error('Failed to load work order details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorkOrderDetail();

    const fetchAllSparePartsAndUsers = async () => {
      try {
        const spData = await sparePartsApi.getAll() as SparePart[];
        setAllSpareParts(spData);
      } catch (err) {
        console.error('Error fetching spare parts:', err);
        toast.error('Failed to load spare parts for selection.');
      }

      try {
        const usersData = await usersApi.getAll() as User[];
        // Filter for assignable roles, e.g., MaintenanceTechnician
        const technicians = usersData.filter(u => u.role.toLowerCase().includes('technician') || u.role.toLowerCase().includes('maintenance'));
        setAssignableUsers(technicians);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Failed to load users for assignment.');
      }
    };
    fetchAllSparePartsAndUsers();
  }, [fetchWorkOrderDetail]); // fetchWorkOrderDetail is a dependency due to useCallback


  const handlePartUsedChange = (partId: string, quantityStr: string) => {
    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity < 0) return;

    setPartsUsedForUpdate(prev => {
      const existingPartIndex = prev.findIndex(p => p.id === partId);
      if (quantity === 0) { // Remove part if quantity is 0
        return prev.filter(p => p.id !== partId);
      }
      if (existingPartIndex > -1) {
        const updatedParts = [...prev];
        updatedParts[existingPartIndex] = { ...updatedParts[existingPartIndex], quantity };
        return updatedParts;
      } else {
        return [...prev, { id: partId, quantity }];
      }
    });
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !workOrder) return;

    setIsUpdating(true);
    try {
      let finalStatus = statusForUpdate as WorkOrder['status'];
      // Auto-status change on assignment
      if (assignedToForUpdate && assignedToForUpdate !== (workOrder.assignedTo || '') && (statusForUpdate === 'Reported' || statusForUpdate === 'Pending')) {
        finalStatus = 'Assigned';
        setStatusForUpdate('Assigned'); // Update local state as well
      }

      const updatePayload: Partial<WorkOrder> = {
        status: finalStatus,
        actions: actionsTaken,
        completionNotes,
        partsUsed: partsUsedForUpdate.length > 0 ? JSON.stringify(partsUsedForUpdate) : null,
        assignedTo: assignedToForUpdate === '' ? null : assignedToForUpdate,
      };

      await workOrdersApi.update(id, updatePayload);
      toast.success('Work Order updated successfully!');
      fetchWorkOrderDetail(); // Refresh data
    } catch (err) {
      console.error('Error updating work order:', err);
      toast.error('Failed to update work order.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Go Back</button>
      </div>
    );
  }

  if (!workOrder) {
    return <div className="p-6 text-center">Work Order not found.</div>;
  }

  // Parse sparePartsNeeded and partsUsed for display
  let neededPartsDisplay: { name: string, quantity: number }[] = [];
  if (workOrder.sparePartsNeeded) {
    try {
      const needed = JSON.parse(workOrder.sparePartsNeeded) as PartUsedInput[];
      neededPartsDisplay = needed.map(np => ({
        name: allSpareParts.find(sp => sp.id === np.id)?.name || np.id,
        quantity: np.quantity
      }));
    } catch (e) { console.error("Error parsing sparePartsNeeded JSON:", e); }
  }

  let usedPartsDisplay: { name: string, quantity: number }[] = [];
   if (workOrder.partsUsed) {
    try {
      const used = JSON.parse(workOrder.partsUsed) as PartUsedInput[];
      usedPartsDisplay = used.map(up => ({
        name: allSpareParts.find(sp => sp.id === up.id)?.name || up.id,
        quantity: up.quantity
      }));
    } catch (e) { console.error("Error parsing partsUsed JSON for display:", e); }
  }


  const canUpdateWorkOrder = user?.role === 'MaintenanceTechnician' || user?.role === 'Admin' || user?.role === 'BiomedicalEngineer'; // Extended permission

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Work Orders
      </button>

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Order: {workOrder.issue}</h1>
          <p className="text-sm text-gray-500">ID: {workOrder.id}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 text-sm">
          <div><strong className="font-medium text-gray-700">Equipment:</strong> {equipmentDetails ? `${equipmentDetails.manufacturerName} ${equipmentDetails.modelNumber} (S/N: ${equipmentDetails.serialNumber})` : workOrder.equipmentId}</div>
          <div><strong className="font-medium text-gray-700">Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${workOrder.status === 'Completed' ? 'bg-green-100 text-green-800' : workOrder.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{workOrder.status}</span></div>
          <div><strong className="font-medium text-gray-700">Priority:</strong> {workOrder.priority || 'N/A'}</div>
          <div><strong className="font-medium text-gray-700">Type:</strong> {workOrder.type || 'N/A'}</div>
          <div><strong className="font-medium text-gray-700">Reported By:</strong> {workOrder.reportedBy}</div>
          <div><strong className="font-medium text-gray-700">Reported At:</strong> {new Date(workOrder.reportedAt).toLocaleString()}</div>
          <div><strong className="font-medium text-gray-700">Assigned To:</strong> {workOrder.assignedTo || 'Unassigned'}</div>
          <div><strong className="font-medium text-gray-700">Last Updated:</strong> {new Date(workOrder.updatedAt).toLocaleString()}</div>
        </div>

        {workOrder.description && <div className="mb-6"><strong className="font-medium text-gray-700 block mb-1">Description:</strong><p className="text-gray-600 whitespace-pre-wrap">{workOrder.description}</p></div>}

        {neededPartsDisplay.length > 0 && (
          <div className="mb-6">
            <strong className="font-medium text-gray-700 block mb-1">Spare Parts Needed:</strong>
            <ul className="list-disc list-inside text-gray-600">
              {neededPartsDisplay.map(p => <li key={p.name}>{p.name} (Quantity: {p.quantity})</li>)}
            </ul>
          </div>
        )}

        {usedPartsDisplay.length > 0 && (
           <div className="mb-6">
            <strong className="font-medium text-gray-700 block mb-1">Spare Parts Used (Previously):</strong>
            <ul className="list-disc list-inside text-gray-600">
              {usedPartsDisplay.map(p => <li key={p.name}>{p.name} (Quantity: {p.quantity})</li>)}
            </ul>
          </div>
        )}

        {/* Update Form for Maintenance Techs (and Admins/BMEs for now) */}
        {canUpdateWorkOrder && (
          <form onSubmit={handleSubmitUpdate} className="mt-8 border-t border-gray-200 pt-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Work Order</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="statusSelect"
                  value={statusForUpdate}
                  onChange={(e) => setStatusForUpdate(e.target.value as WorkOrder['status'])}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Reported">Reported</option>
                  <option value="Pending">Pending</option> {/* Ensure this status is valid if used */}
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {(user?.role === 'Admin' || user?.role === 'BiomedicalEngineer') && (
                <div>
                  <label htmlFor="assignToSelect" className="block text-sm font-medium text-gray-700">Assign To</label>
                  <div className="relative mt-1">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      id="assignToSelect"
                      value={assignedToForUpdate}
                      onChange={(e) => setAssignedToForUpdate(e.target.value)}
                      className="block w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Unassign</option>
                      {assignableUsers.map(u => (
                        <option key={u.id} value={u.username}> {/* Or u.id if backend expects ID */}
                          {u.username} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="actionsTaken" className="block text-sm font-medium text-gray-700 mt-4">Actions Taken</label>
              <textarea
                id="actionsTaken"
                value={actionsTaken}
                onChange={(e) => setActionsTaken(e.target.value)}
                rows={4}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe actions performed..."
              />
            </div>

            <div>
              <label htmlFor="completionNotes" className="block text-sm font-medium text-gray-700">Completion Notes</label>
              <textarea
                id="completionNotes"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Notes on completion (if any)..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parts Used (Update/Add)</label>
              <div className="space-y-3 max-h-60 overflow-y-auto p-2 border rounded-md">
                {allSpareParts.map(part => (
                  <div key={part.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-800">{part.name} (Avail: {part.quantity})</span>
                    <input
                      type="number"
                      min="0"
                      // max={part.quantity} // Max should ideally consider parts already used + new usage vs available
                      value={partsUsedForUpdate.find(p => p.id === part.id)?.quantity || 0}
                      onChange={(e) => handlePartUsedChange(part.id, e.target.value)}
                      className="w-20 p-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WorkOrderDetailPage;
