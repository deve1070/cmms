import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { equipmentApi, maintenanceApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Equipment {
  id: string;
  serialNumber: string;
  model: string;
  location: string;
  status: string;
}

const ReportMaintenance: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    equipmentId: '',
    maintenanceDate: '',
    maintenanceType: '',
    description: '',
    nextMaintenanceDate: '',
    issuesEncountered: '',
    maintenanceStatus: 'fully_maintained',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await equipmentApi.getAll();
        setEquipment(data as Equipment[]);
      } catch (error) {
        toast.error('Failed to fetch equipment list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedEquipment = equipment.find(eq => eq.id === formData.equipmentId);
      if (!selectedEquipment) {
        throw new Error('Selected equipment not found');
      }

      // Create maintenance history record
      await maintenanceApi.create(formData.equipmentId, {
        type: formData.maintenanceType,
        description: formData.description,
        performedBy: user?.username || 'Unknown',
        date: formData.maintenanceDate,
        partsUsed: formData.issuesEncountered
      });

      // Update equipment status
      await equipmentApi.update(formData.equipmentId, {
        status: formData.maintenanceStatus === 'fully_maintained' ? 'Operational' : 'Maintenance Required'
      });
      
      toast.success('Maintenance reported successfully!');
      navigate('/maintenance/dashboard');
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Report Equipment Maintenance</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Equipment Selection */}
          <div>
            <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700 mb-2">
              Equipment
            </label>
            <select
              id="equipmentId"
              name="equipmentId"
              value={formData.equipmentId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Equipment</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.model} ({eq.serialNumber}) - {eq.location}
                </option>
              ))}
            </select>
          </div>

          {/* Maintenance Date */}
          <div>
            <label htmlFor="maintenanceDate" className="block text-sm font-medium text-gray-700 mb-2">
              Maintenance Date
            </label>
            <input
              type="date"
              id="maintenanceDate"
              name="maintenanceDate"
              value={formData.maintenanceDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Maintenance Type */}
          <div>
            <label htmlFor="maintenanceType" className="block text-sm font-medium text-gray-700 mb-2">
              Maintenance Type
            </label>
            <select
              id="maintenanceType"
              name="maintenanceType"
              value={formData.maintenanceType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Maintenance Type</option>
              <option value="Preventive">Preventive Maintenance</option>
              <option value="Corrective">Corrective Maintenance</option>
              <option value="Calibration">Calibration</option>
              <option value="Repair">Repair</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description of Work */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description of Work
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide detailed information about the maintenance performed..."
            />
          </div>

          {/* Next Scheduled Maintenance Date */}
          <div>
            <label htmlFor="nextMaintenanceDate" className="block text-sm font-medium text-gray-700 mb-2">
              Next Scheduled Maintenance Date (Optional)
            </label>
            <input
              type="date"
              id="nextMaintenanceDate"
              name="nextMaintenanceDate"
              value={formData.nextMaintenanceDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Issues Encountered */}
          <div>
            <label htmlFor="issuesEncountered" className="block text-sm font-medium text-gray-700 mb-2">
              Issues Encountered During Maintenance (Optional)
            </label>
            <textarea
              id="issuesEncountered"
              name="issuesEncountered"
              value={formData.issuesEncountered}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any unexpected issues or observations..."
            />
          </div>

          {/* Maintenance Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maintenance Status
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="maintenanceStatus"
                  value="fully_maintained"
                  checked={formData.maintenanceStatus === 'fully_maintained'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Fully Maintained</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="maintenanceStatus"
                  value="further_action"
                  checked={formData.maintenanceStatus === 'further_action'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-orange-600"
                />
                <span className="ml-2 text-gray-700">Further Action Required</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/maintenance/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReportMaintenance;
