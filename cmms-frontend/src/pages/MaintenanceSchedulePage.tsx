import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceApi } from '../services/api';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { MaintenanceSchedule } from '../types/maintenance';

const MaintenanceScheduleView: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        const response = await maintenanceApi.getAll({});
        // Convert MaintenanceReport[] to MaintenanceSchedule[] and filter out emergency reports
        const scheduleData = response
          .filter(report => report.type === 'preventive' || report.type === 'corrective')
          .map(report => ({
            id: report.id,
            equipmentId: report.equipmentId,
            type: report.type as 'preventive' | 'corrective',
            status: report.status,
            scheduledDate: report.date,
            description: report.description,
            equipment: report.equipment
          }));
        setSchedules(scheduleData);
      } catch (error) {
        console.error('Error fetching maintenance schedules:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const filteredSchedules = schedules.filter(schedule => {
    if (filter === 'all') return true;
    return schedule.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5" />;
      case 'pending':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Maintenance Schedule</h1>
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Schedules</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-blue-600">Loading schedules...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      {schedule.equipment?.model || 'Unknown Model'}
                    </h3>
                    <p className="text-sm text-blue-600">
                      S/N: {schedule.equipment?.serialNumber || 'Unknown'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(schedule.status)}`}>
                    {getStatusIcon(schedule.status)}
                    <span>{typeof schedule.status === 'string' ? schedule.status.replace('_', ' ') : 'Unknown'}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-blue-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>
                      Scheduled: {schedule.scheduledDate ? new Date(schedule.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                    </span>
                  </div>
                  <p className="text-blue-900">{schedule.description}</p>
                  <div className="flex items-center text-sm text-blue-600">
                    <span className="font-medium">Type:</span>
                    <span className="ml-2 capitalize">{schedule.type}</span>
                  </div>
                  <div className="flex items-center text-sm text-blue-600">
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{schedule.equipment?.location || 'Unknown'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-100">
                  <button
                    onClick={() => navigate(`/maintenance/work-orders/${schedule.id}`)}
                    className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceScheduleView; 