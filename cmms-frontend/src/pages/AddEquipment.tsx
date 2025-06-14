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
import { equipmentApi } from '../services/api';
import { Equipment } from '../types/equipment';
import BiomedicalSidebar from '../components/BiomedicalSidebar';
import SharedLayout from '../components/SharedLayout';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  name: string;
  type: string;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  description: string;
  status: string;
}

const AddEquipment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    location: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpiry: '',
    description: '',
    status: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestData = {
        ...formData,
        role: user?.role
      };
      await equipmentApi.create(requestData);
      toast.success('Equipment added successfully');
      navigate('/biomedical/equipment');
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast.error('Failed to add equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SharedLayout title="Add Equipment" sidebar={<BiomedicalSidebar />}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Add New Equipment</h1>
            <Button variant="outline" onClick={() => navigate('/biomedical/equipment')}>
              Cancel
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <Label htmlFor="name">Equipment Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  name="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={handleChange}
                />
              </div>

              {/* Description and Status */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operational">Operational</SelectItem>
                    <SelectItem value="Needs Maintenance">Needs Maintenance</SelectItem>
                    <SelectItem value="Out of Service">Out of Service</SelectItem>
                    <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Equipment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SharedLayout>
  );
};

export default AddEquipment; 