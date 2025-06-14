import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'react-hot-toast';

const NewWorkOrder: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    equipmentId: '',
    type: '',
    priority: '',
    description: '',
    assignedTo: '',
    dueDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to create work order
      toast.success('Work order created successfully');
      navigate('/biomedical/work-orders');
    } catch (error) {
      toast.error('Failed to create work order');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create New Work Order</h1>
        <Button variant="outline" onClick={() => navigate('/biomedical/work-orders')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="equipmentId">Equipment</Label>
          <Select
            value={formData.equipmentId}
            onValueChange={(value) => handleSelectChange('equipmentId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">MRI Scanner</SelectItem>
              <SelectItem value="2">CT Scanner</SelectItem>
              <SelectItem value="3">X-Ray Machine</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Work Order Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preventive">Preventive Maintenance</SelectItem>
              <SelectItem value="corrective">Corrective Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assign To</Label>
          <Select
            value={formData.assignedTo}
            onValueChange={(value) => handleSelectChange('assignedTo', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select technician" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">John Doe</SelectItem>
              <SelectItem value="2">Jane Smith</SelectItem>
              <SelectItem value="3">Mike Johnson</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit">Create Work Order</Button>
        </div>
      </form>
    </div>
  );
};

export default NewWorkOrder; 