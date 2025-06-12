import React, { useState, useEffect, useCallback } from 'react';
// useNavigate is not used in this version, but keeping for potential future use
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { schedulesApi } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  CalendarDaysIcon, ExclamationTriangleIcon, PlayCircleIcon, ArrowPathIcon,
  PencilIcon, TrashIcon, XMarkIcon, PlusIcon // Added icons for CRUD
} from '@heroicons/react/24/outline';

// Interfaces
interface EquipmentLite {
  id: string;
  modelNumber?: string;
  serialNumber?: string;
  manufacturerName?: string;
}

interface UserLite {
  id: string;
  username?: string;
}

interface PreventiveMaintenanceSchedule {
  id: string;
  equipmentId: string;
  equipment?: EquipmentLite; // Populated by include
  taskDescription: string;
  frequency: string; // "Daily", "Weekly", "Monthly", "Quarterly", "Annually"
  nextDueDate: string; // ISO date string
  lastGeneratedDate?: string | null; // ISO date string
  isActive: boolean;
  assignedToUserId?: string | null;
  assignedToUser?: UserLite; // Populated by include
  notes?: string | null;
  createdAt: string; // ISO date string
  updatedAt: string;
}

interface GenerateResponse {
  message: string;
  generatedCount: number;
  errorCount: number;
  errors?: { scheduleId: string, error: string }[];
}

// Type for form data, making optional fields truly optional for creation
type ScheduleFormData = Partial<Omit<PreventiveMaintenanceSchedule, 'id' | 'createdAt' | 'updatedAt' | 'equipment' | 'assignedToUser' | 'lastGeneratedDate'>> & {
  equipmentId: string;
  taskDescription: string;
  frequency: string;
  nextDueDate: string; // Will be string from date input, convert before sending
};

const initialFormData: ScheduleFormData = {
  equipmentId: '',
  taskDescription: '',
  frequency: 'Monthly', // Default frequency
  nextDueDate: new Date().toISOString().split('T')[0], // Default to today in yyyy-MM-dd
  isActive: true,
  assignedToUserId: '',
  notes: '',
};


const PreventiveMaintenanceSchedulesList: React.FC = () => {
  // const navigate = useNavigate(); // Not used currently
  const { user } = useAuth();

  const [schedules, setSchedules] = useState<PreventiveMaintenanceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [generateLoading, setGenerateLoading] = useState(false);

  // State for CRUD Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSchedule, setSelectedSchedule] = useState<PreventiveMaintenanceSchedule | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>(initialFormData);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);


  const fetchSchedules = useCallback(async () => {
    setIsLoading(true); // Ensure loading is true at the start of fetch
    setError(null);
    try {
      const data = await schedulesApi.getAll();
      setSchedules(data as PreventiveMaintenanceSchedule[]);
    } catch (err) {
      console.error('Error fetching PM schedules:', err);
      setError('Failed to load preventive maintenance schedules.');
      toast.error('Failed to load PM schedules.');
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleGenerateWorkOrders = async () => {
    setGenerateLoading(true);
    // setGenerateResponse(null);
    try {
      const response = await schedulesApi.generateWorkOrders() as GenerateResponse;
      toast.success(`${response.message} Generated: ${response.generatedCount}, Errors: ${response.errorCount}.`);
      if (response.errorCount > 0 && response.errors) {
        response.errors.forEach(err => {
          toast.error(`Schedule ${err.scheduleId}: ${err.error}`, { duration: 5000 });
        });
      }
      // setGenerateResponse(response);
      fetchSchedules(); // Refresh the list to show updated nextDueDates
    } catch (err: any) {
      console.error('Error generating PM work orders:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to generate PM work orders.');
      // setGenerateResponse({ message: 'Failed to trigger generation.', generatedCount: 0, errorCount: 1, errors: [{scheduleId: 'N/A', error: err.message }]});
    } finally {
      setGenerateLoading(false);
    }
  };

  // TODO: Add Admin check for the generate button if not already handled by backend route protection
  // const canManageSchedules = user?.role === 'Admin';

  const handleOpenModal = (mode: 'add' | 'edit', schedule: PreventiveMaintenanceSchedule | null = null) => {
    setModalMode(mode);
    setSelectedSchedule(schedule);
    if (mode === 'add' || !schedule) {
      setFormData(initialFormData);
    } else {
      setFormData({
        equipmentId: schedule.equipmentId,
        taskDescription: schedule.taskDescription,
        frequency: schedule.frequency,
        nextDueDate: schedule.nextDueDate ? new Date(schedule.nextDueDate).toISOString().split('T')[0] : '',
        isActive: schedule.isActive,
        assignedToUserId: schedule.assignedToUserId || '',
        notes: schedule.notes || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
    setFormData(initialFormData);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingModal(true);

    const payload = {
      ...formData,
      nextDueDate: new Date(formData.nextDueDate).toISOString(), // Ensure ISO string for backend
      assignedToUserId: formData.assignedToUserId || null, // Send null if empty
      isActive: formData.isActive === undefined ? true : formData.isActive, // Default isActive if undefined
    };

    try {
      if (modalMode === 'add') {
        await schedulesApi.create(payload);
        toast.success('Schedule created successfully!');
      } else if (selectedSchedule) {
        await schedulesApi.update(selectedSchedule.id, payload);
        toast.success('Schedule updated successfully!');
      }
      fetchSchedules();
      handleCloseModal();
    } catch (err: any) {
      console.error(`Error ${modalMode === 'add' ? 'creating' : 'updating'} schedule:`, err);
      toast.error(err.response?.data?.error || `Failed to ${modalMode === 'add' ? 'create' : 'update'} schedule.`);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      try {
        await schedulesApi.delete(scheduleId);
        toast.success('Schedule deleted successfully!');
        fetchSchedules();
      } catch (err: any) {
        console.error('Error deleting schedule:', err);
        toast.error(err.response?.data?.error || 'Failed to delete schedule.');
      }
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
        <button onClick={fetchSchedules} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Try Again</button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <CalendarDaysIcon className="h-7 w-7 mr-2 text-blue-600" />
          Preventive Maintenance Schedules
        </h1>
        <div className="flex space-x-3">
           <button
            onClick={fetchSchedules} // Keep refresh button
            disabled={isLoading || generateLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh List
          </button>
          {user?.role === 'Admin' && ( // Generate button for Admin
            <button
              onClick={handleGenerateWorkOrders}
              disabled={generateLoading || isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <PlayCircleIcon className="h-5 w-5 mr-2" />
              {generateLoading ? 'Generating...' : 'Generate PM WOs'}
            </button>
          )}
          {user?.role === 'Admin' && ( // Add Schedule button for Admin
            <button
              onClick={() => handleOpenModal('add')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Schedule
            </button>
          )}
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white shadow-md overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Gen.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                  No preventive maintenance schedules found.
                </td>
              </tr>
            ) : (
              schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {schedule.equipment ?
                     `${schedule.equipment.manufacturerName || ''} ${schedule.equipment.modelNumber || ''} (S/N: ${schedule.equipment.serialNumber || 'N/A'})`
                     : schedule.equipmentId}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700">{schedule.taskDescription}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{schedule.frequency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(schedule.nextDueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {schedule.lastGeneratedDate ? new Date(schedule.lastGeneratedDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {schedule.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{schedule.assignedToUser?.username || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {user?.role === 'Admin' && (
                      <>
                        <button onClick={() => handleOpenModal('edit', schedule)} className="text-indigo-600 hover:text-indigo-900">
                          <PencilIcon className="h-5 w-5 inline-block" />
                        </button>
                        <button onClick={() => handleDeleteSchedule(schedule.id)} className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-5 w-5 inline-block" />
                        </button>
                      </>
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
              <h2 className="text-xl font-bold text-gray-800">{modalMode === 'add' ? 'Add New Schedule' : 'Edit Schedule'}</h2>
              <button onClick={handleCloseModal}><XMarkIcon className="h-6 w-6 text-gray-600 hover:text-gray-800" /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700">Equipment ID*</label>
                {/* TODO: Enhance to searchable dropdown of equipment */}
                <input type="text" name="equipmentId" id="equipmentId" value={formData.equipmentId || ''} onChange={handleFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700">Task Description*</label>
                <textarea name="taskDescription" id="taskDescription" value={formData.taskDescription || ''} onChange={handleFormChange} required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
              </div>
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency*</label>
                <select name="frequency" id="frequency" value={formData.frequency || 'Monthly'} onChange={handleFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
              <div>
                <label htmlFor="nextDueDate" className="block text-sm font-medium text-gray-700">Next Due Date*</label>
                <input type="date" name="nextDueDate" id="nextDueDate" value={formData.nextDueDate || ''} onChange={handleFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="assignedToUserId" className="block text-sm font-medium text-gray-700">Assigned To User ID (Optional)</label>
                {/* TODO: Enhance to searchable dropdown of users */}
                <input type="text" name="assignedToUserId" id="assignedToUserId" value={formData.assignedToUserId || ''} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleFormChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive === undefined ? true : formData.isActive} onChange={handleFormChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active</label>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmittingModal} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {isSubmittingModal ? 'Saving...' : (modalMode === 'add' ? 'Create Schedule' : 'Update Schedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreventiveMaintenanceSchedulesList;
