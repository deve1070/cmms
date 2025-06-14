import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { maintenanceApi } from '../services/api';
import { toast } from 'react-hot-toast';
import type { MaintenanceReport } from '../types/maintenance';

const MaintenanceSchedule: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceReport[]>([]);
  const [selectedTask, setSelectedTask] = useState<MaintenanceReport | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    const fetchMaintenanceTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const allTasks = await maintenanceApi.getAll();
        
        // Filter tasks based on selected filter
        const filteredTasks = allTasks.filter(task => {
          switch (filter) {
            case 'upcoming':
              return task.status === 'Scheduled' && new Date(task.nextDueDate || task.createdAt) > new Date();
            case 'in-progress':
              return task.status === 'In Progress';
            case 'completed':
              return task.status === 'Completed';
            default:
              return true;
          }
        });

        // Sort by due date
        const sortedTasks = filteredTasks.sort((a, b) => 
          new Date(a.nextDueDate || a.createdAt).getTime() - 
          new Date(b.nextDueDate || b.createdAt).getTime()
        );

        setMaintenanceTasks(sortedTasks);

        // If there's an ID in the URL, find and set the selected task
        if (id) {
          const task = sortedTasks.find(t => t.id === id);
          if (task) {
            setSelectedTask(task);
          } else {
            toast.error('Maintenance task not found');
            navigate('/maintenance/schedule');
          }
        }
      } catch (err) {
        console.error('Error fetching maintenance tasks:', err);
        setError('Failed to load maintenance schedule');
        toast.error('Failed to load maintenance schedule');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchMaintenanceTasks();
    }
  }, [user?.id, id, navigate, filter]);

  const handleStatusUpdate = async (taskId: string, newStatus: MaintenanceReport['status']) => {
    try {
      await maintenanceApi.update(taskId, { status: newStatus });
      toast.success('Maintenance task status updated');
      
      // Refresh the tasks list
      const updatedTasks = maintenanceTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      setMaintenanceTasks(updatedTasks);
      
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating maintenance task:', err);
      toast.error('Failed to update maintenance task status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'in-progress' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance Tasks List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Maintenance Tasks</h2>
              <div className="space-y-4">
                {maintenanceTasks.length > 0 ? (
                  maintenanceTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border ${
                        selectedTask?.id === task.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      } cursor-pointer transition-colors`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{task.equipment.name}</p>
                          <p className="text-sm text-gray-600">{task.type} Maintenance</p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(task.nextDueDate || task.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      {task.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No maintenance tasks found</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Task Details */}
        <div className="lg:col-span-1">
          {selectedTask ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Task Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Equipment</p>
                  <p className="font-medium">{selectedTask.equipment.name}</p>
                  <p className="text-xs text-gray-500">{selectedTask.equipment.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p>{selectedTask.type} Maintenance</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedTask.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      selectedTask.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedTask.status}
                    </span>
                    {selectedTask.status !== 'Completed' && (
                      <button
                        onClick={() => handleStatusUpdate(
                          selectedTask.id,
                          selectedTask.status === 'In Progress' ? 'Completed' : 'In Progress'
                        )}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {selectedTask.status === 'In Progress' ? 'Mark as Completed' : 'Start Work'}
                      </button>
                    )}
                  </div>
                </div>
                {selectedTask.description && (
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="whitespace-pre-wrap">{selectedTask.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p>{new Date(selectedTask.nextDueDate || selectedTask.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500 text-center">Select a task to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSchedule; 