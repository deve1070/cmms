import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { workOrdersApi } from '../services/api';
import { toast } from 'react-hot-toast';
import type { WorkOrder } from '../types/workOrder';
import SharedLayout from '../components/SharedLayout';
import { getUserDisplayName } from '../types/auth';

const sidebar = (
  <nav className="flex flex-col space-y-1 p-4">
    {[
      { name: 'Dashboard', icon: 'BarChart3', path: '/maintenance/dashboard' },
      { name: 'My Work Orders', icon: 'Wrench', path: '/maintenance/work-orders' },
      { name: 'View Schedule', icon: 'Calendar', path: '/maintenance/schedule' },
      { name: 'Spare Parts Inventory', icon: 'Package2', path: '/maintenance/spare-parts' },
      { name: 'My Activity Log', icon: 'ClipboardCheck', path: '/maintenance/activity-log' },
    ].map((item) => (
      <a
        key={item.name}
        href={item.path}
        className="flex items-center space-x-2 p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
      >
        <span>{item.name}</span>
      </a>
    ))}
  </nav>
);

const MaintenanceRequests: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const allWorkOrders = await workOrdersApi.getAll();
        const myWorkOrders = allWorkOrders.filter(wo => 
          wo.assignedToId === user?.id || 
          (wo.status === 'Assigned' && !wo.assignedToId) ||
          (wo.status === 'Open' && wo.type === 'Preventive')
        );

        // Sort by priority and due date
        const sortedWorkOrders = myWorkOrders.sort((a, b) => {
          const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          
          return new Date(a.completionDate || a.createdAt).getTime() - 
                 new Date(b.completionDate || b.createdAt).getTime();
        });

        setWorkOrders(sortedWorkOrders);

        // If there's an ID in the URL, find and set the selected work order
        if (id) {
          const workOrder = sortedWorkOrders.find(wo => wo.id === id);
          if (workOrder) {
            setSelectedWorkOrder(workOrder);
          } else {
            toast.error('Work order not found');
            navigate('/maintenance/work-orders');
          }
        }
      } catch (err) {
        console.error('Error fetching work orders:', err);
        setError('Failed to load work orders');
        toast.error('Failed to load work orders');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchWorkOrders();
    }
  }, [user?.id, id, navigate]);

  const handleStatusUpdate = async (workOrderId: string, newStatus: WorkOrder['status']) => {
    try {
      await workOrdersApi.update(workOrderId, { status: newStatus });
      toast.success('Work order status updated');
      
      // Refresh the work orders list
      const updatedWorkOrders = workOrders.map(wo => 
        wo.id === workOrderId ? { ...wo, status: newStatus } : wo
      );
      setWorkOrders(updatedWorkOrders);
      
      if (selectedWorkOrder?.id === workOrderId) {
        setSelectedWorkOrder({ ...selectedWorkOrder, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating work order:', err);
      toast.error('Failed to update work order status');
    }
  };

  if (loading) {
    return (
      <SharedLayout 
        title="Work Orders" 
        sidebar={sidebar}
        userDisplayName={getUserDisplayName(user, 'Maintenance Technician')}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </SharedLayout>
    );
  }

  if (error) {
    return (
      <SharedLayout 
        title="Work Orders" 
        sidebar={sidebar}
        userDisplayName={getUserDisplayName(user, 'Maintenance Technician')}
      >
        <div className="text-red-500 text-center p-4">{error}</div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout 
      title="Work Orders" 
      sidebar={sidebar}
      userDisplayName={getUserDisplayName(user, 'Maintenance Technician')}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Work Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">My Work Orders</h2>
                <div className="space-y-4">
                  {workOrders.length > 0 ? (
                    workOrders.map((workOrder) => (
                      <div
                        key={workOrder.id}
                        className={`p-4 rounded-lg border ${
                          selectedWorkOrder?.id === workOrder.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        } cursor-pointer transition-colors`}
                        onClick={() => setSelectedWorkOrder(workOrder)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{workOrder.issue}</p>
                            <p className="text-sm text-gray-600">{workOrder.equipment.name}</p>
                            <p className="text-xs text-gray-500">
                              Due: {new Date(workOrder.completionDate || workOrder.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            workOrder.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            workOrder.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {workOrder.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            workOrder.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            workOrder.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            workOrder.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {workOrder.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {workOrder.type}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No work orders assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Work Order Details */}
          <div className="lg:col-span-1">
            {selectedWorkOrder ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Work Order Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Issue</p>
                    <p className="font-medium">{selectedWorkOrder.issue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Equipment</p>
                    <p className="font-medium">{selectedWorkOrder.equipment.name}</p>
                    <p className="text-xs text-gray-500">{selectedWorkOrder.equipment.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        selectedWorkOrder.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        selectedWorkOrder.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedWorkOrder.status}
                      </span>
                      {selectedWorkOrder.status !== 'Completed' && (
                        <button
                          onClick={() => handleStatusUpdate(
                            selectedWorkOrder.id,
                            selectedWorkOrder.status === 'In Progress' ? 'Completed' : 'In Progress'
                          )}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {selectedWorkOrder.status === 'In Progress' ? 'Mark as Completed' : 'Start Work'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <span className={`px-2 py-1 rounded text-sm ${
                      selectedWorkOrder.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      selectedWorkOrder.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      selectedWorkOrder.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedWorkOrder.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p>{selectedWorkOrder.type}</p>
                  </div>
                  {selectedWorkOrder.description && (
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="whitespace-pre-wrap">{selectedWorkOrder.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p>{new Date(selectedWorkOrder.completionDate || selectedWorkOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-center">Select a work order to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default MaintenanceRequests; 