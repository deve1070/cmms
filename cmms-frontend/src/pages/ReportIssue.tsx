import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { equipmentApi, workOrdersApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Equipment {
  id: string;
  serialNumber: string;
  model: string;
  location: string;
  status: string;
}

interface WorkOrder {
  id: string;
  equipmentId: string;
  issue: string;
  type: string;
  status: string;
  assignedTo: string;
  reportedBy: string;
  createdAt: string;
  completedAt?: string;
}

const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await equipmentApi.getAll() as Equipment[];
        setEquipment(data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        toast.error('Failed to fetch equipment list');
      }
    };

    fetchEquipment();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || !issue) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await workOrdersApi.create({
        equipmentId: selectedEquipment,
        issue,
        type: 'maintenance',
        assignedTo: '', // Will be assigned by admin
        reportedBy: user?.id || '',
        actions: `Priority: ${priority}`
      });

      toast.success('Issue reported successfully');
      navigate('/lab/dashboard');
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error('Failed to report issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/lab/dashboard')}
              className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-blue-900">Report Equipment Issue</h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Equipment Selection */}
            <div>
              <label htmlFor="equipment" className="block text-sm font-medium text-blue-900 mb-2">
                Select Equipment
              </label>
              <select
                id="equipment"
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select equipment...</option>
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.model} (S/N: {item.serialNumber}) - {item.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Description */}
            <div>
              <label htmlFor="issue" className="block text-sm font-medium text-blue-900 mb-2">
                Issue Description
              </label>
              <textarea
                id="issue"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the issue in detail..."
                required
              />
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`p-3 rounded-lg border ${
                    priority === 'low'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`p-3 rounded-lg border ${
                    priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`p-3 rounded-lg border ${
                    priority === 'high'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/lab/dashboard')}
                className="px-6 py-3 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue; 