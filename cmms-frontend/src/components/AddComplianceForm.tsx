import React, { useState, useEffect } from 'react';
import { complianceApi, equipmentApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { Equipment } from '../types/equipment';

interface AddComplianceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddComplianceForm: React.FC<AddComplianceFormProps> = ({ onSuccess, onCancel }) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [formData, setFormData] = useState({
    equipmentId: '',
    standard: '',
    status: 'pending',
    lastCheck: new Date().toISOString().split('T')[0],
    nextDue: '',
    notes: ''
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await equipmentApi.getAll();
        setEquipment(data);
      } catch (error) {
        toast.error('Failed to fetch equipment');
      }
    };
    fetchEquipment();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await complianceApi.create(formData);
      toast.success('Compliance record added successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to add compliance record');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700">
          Equipment
        </label>
        <select
          id="equipmentId"
          name="equipmentId"
          value={formData.equipmentId}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          required
        >
          <option value="">Select equipment</option>
          {equipment.map(eq => (
            <option key={eq.id} value={eq.id}>
              {eq.manufacturerName} {eq.modelNumber} - {eq.serialNumber}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="standard" className="block text-sm font-medium text-gray-700">
          Standard
        </label>
        <select
          id="standard"
          name="standard"
          value={formData.standard}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          required
        >
          <option value="">Select standard</option>
          <option value="ISO 15189">ISO 15189</option>
          <option value="ISO 13485">ISO 13485</option>
          <option value="IEC 60601">IEC 60601</option>
          <option value="FDA 21 CFR">FDA 21 CFR</option>
          <option value="CE Marking">CE Marking</option>
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          required
        >
          <option value="pending">Pending</option>
          <option value="compliant">Compliant</option>
          <option value="non-compliant">Non-Compliant</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div>
        <label htmlFor="lastCheck" className="block text-sm font-medium text-gray-700">
          Last Check Date
        </label>
        <input
          type="date"
          id="lastCheck"
          name="lastCheck"
          value={formData.lastCheck}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          required
        />
      </div>

      <div>
        <label htmlFor="nextDue" className="block text-sm font-medium text-gray-700">
          Next Due Date
        </label>
        <input
          type="date"
          id="nextDue"
          name="nextDue"
          value={formData.nextDue}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          required
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Compliance Record
        </button>
      </div>
    </form>
  );
};

export default AddComplianceForm; 