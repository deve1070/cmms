import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { equipmentApi, workOrdersApi, sparePartsApi } from '../services/api';

interface Equipment {
  id: string;
  serialNumber: string;
  model: string;
  location: string;
}

interface SparePart {
  id: string;
  name: string;
  quantity: number;
}

interface WorkOrderCreate {
  equipmentId: string;
  issue: string;
  type: string;
  assignedTo: string;
  reportedBy: string;
  sparePartsUsed?: { id: string; quantity: number }[];
}

const NewWorkOrder: React.FC = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [issue, setIssue] = useState('');
  const [selectedSpareParts, setSelectedSpareParts] = useState<{ id: string; quantity: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipmentData, sparePartsData] = await Promise.all([
          equipmentApi.getAll(),
          sparePartsApi.getAll(),
        ]) as [Equipment[], SparePart[]];
        setEquipment(equipmentData);
        setSpareParts(sparePartsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment || !issue) return;

    try {
      setIsLoading(true);
      const workOrderData: WorkOrderCreate = {
        equipmentId: selectedEquipment,
        issue,
        type: 'maintenance',
        assignedTo: '', // Will be assigned by the system
        reportedBy: '', // Will be filled by the backend
        sparePartsUsed: selectedSpareParts,
      };
      await workOrdersApi.create(workOrderData);
      navigate('/maintenance/work-orders');
    } catch (error) {
      console.error('Error creating work order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSparePartChange = (partId: string, quantity: number) => {
    setSelectedSpareParts(prev => {
      const existing = prev.find(p => p.id === partId);
      if (existing) {
        return prev.map(p => p.id === partId ? { ...p, quantity } : p);
      }
      return [...prev, { id: partId, quantity }];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Create New Work Order</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
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
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.model} - {eq.serialNumber} ({eq.location})
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
              className="w-full p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              required
              placeholder="Describe the issue or maintenance required..."
            />
          </div>

          {/* Spare Parts Selection */}
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Spare Parts Required
            </label>
            <div className="space-y-4">
              {spareParts.map((part) => (
                <div key={part.id} className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="0"
                    max={part.quantity}
                    value={selectedSpareParts.find(p => p.id === part.id)?.quantity || 0}
                    onChange={(e) => handleSparePartChange(part.id, parseInt(e.target.value))}
                    className="w-24 p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-blue-900">{part.name}</span>
                  <span className="text-sm text-blue-600">(Available: {part.quantity})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/maintenance/work-orders')}
              className="px-6 py-3 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewWorkOrder; 