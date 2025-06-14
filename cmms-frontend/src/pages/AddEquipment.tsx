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
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  serialNumber: string;
  manufacturerName: string;
  modelNumber: string;
  manufacturerServiceNumber: string;
  vendorName: string;
  vendorCode: string;
  locationDescription: string;
  locationCode: string;
  purchasePrice: string;
  installationDate: string;
  warrantyExpirationDate: string;
  status: string;
  category: string;
  department: string;
}

const AddEquipment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    serialNumber: '',
    manufacturerName: '',
    modelNumber: '',
    manufacturerServiceNumber: '',
    vendorName: '',
    vendorCode: '',
    locationDescription: '',
    locationCode: '',
    purchasePrice: '',
    installationDate: '',
    warrantyExpirationDate: '',
    status: 'Operational',
    category: '',
    department: '',
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
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        installationDate: new Date(formData.installationDate).toISOString(),
        warrantyExpirationDate: new Date(formData.warrantyExpirationDate).toISOString(),
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Add New Equipment</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Label htmlFor="manufacturerName">Manufacturer Name</Label>
              <Input
                id="manufacturerName"
                name="manufacturerName"
                value={formData.manufacturerName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="modelNumber">Model Number</Label>
              <Input
                id="modelNumber"
                name="modelNumber"
                value={formData.modelNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="manufacturerServiceNumber">Manufacturer Service Number</Label>
              <Input
                id="manufacturerServiceNumber"
                name="manufacturerServiceNumber"
                value={formData.manufacturerServiceNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input
                id="vendorName"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="vendorCode">Vendor Code</Label>
              <Input
                id="vendorCode"
                name="vendorCode"
                value={formData.vendorCode}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="locationDescription">Location Description</Label>
              <Input
                id="locationDescription"
                name="locationDescription"
                value={formData.locationDescription}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="locationCode">Location Code</Label>
              <Input
                id="locationCode"
                name="locationCode"
                value={formData.locationCode}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="installationDate">Installation Date</Label>
              <Input
                id="installationDate"
                name="installationDate"
                type="date"
                value={formData.installationDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="warrantyExpirationDate">Warranty Expiration Date</Label>
              <Input
                id="warrantyExpirationDate"
                name="warrantyExpirationDate"
                type="date"
                value={formData.warrantyExpirationDate}
                onChange={handleChange}
                required
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
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/biomedical/equipment')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Equipment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEquipment; 