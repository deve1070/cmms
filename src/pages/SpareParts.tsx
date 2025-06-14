import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SharedLayout from '../components/SharedLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';

interface SparePart {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  location: string;
  supplier: string;
  lastRestocked: string;
  notes: string;
}

const SpareParts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState<keyof SparePart>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [formData, setFormData] = useState<Partial<SparePart>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await fetch('/api/spare-parts');
      if (!response.ok) {
        throw new Error('Failed to fetch spare parts');
      }
      const data = await response.json();
      setParts(data);
    } catch (error) {
      console.error('Error fetching spare parts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch spare parts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPart = async () => {
    try {
      const response = await fetch('/api/spare-parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add spare part');
      }

      await fetchParts();
      setIsAddModalOpen(false);
      setFormData({});
      toast({
        title: 'Success',
        description: 'Spare part added successfully.',
      });
    } catch (error) {
      console.error('Error adding spare part:', error);
      toast({
        title: 'Error',
        description: 'Failed to add spare part. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePart = async () => {
    if (!selectedPart) return;

    try {
      const response = await fetch(`/api/spare-parts/${selectedPart.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update spare part');
      }

      await fetchParts();
      setIsUpdateModalOpen(false);
      setSelectedPart(null);
      setFormData({});
      toast({
        title: 'Success',
        description: 'Spare part updated successfully.',
      });
    } catch (error) {
      console.error('Error updating spare part:', error);
      toast({
        title: 'Error',
        description: 'Failed to update spare part. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePart = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spare part?')) return;

    try {
      const response = await fetch(`/api/spare-parts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete spare part');
      }

      await fetchParts();
      toast({
        title: 'Success',
        description: 'Spare part deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting spare part:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete spare part. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSort = (field: keyof SparePart) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filterParts = (parts: SparePart[]) => {
    return parts.filter((part) => {
      const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const sortParts = (parts: SparePart[]) => {
    return [...parts].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  };

  const filteredAndSortedParts = useMemo(() => {
    const filtered = filterParts(parts);
    return sortParts(filtered);
  }, [parts, searchTerm, selectedCategory, sortField, sortDirection]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(parts.map((part) => part.category));
    return ['all', ...Array.from(categories)];
  }, [parts]);

  return (
    <SharedLayout
      sidebar={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Spare Parts', href: '/spare-parts' },
        { label: 'Equipment', href: '/equipment' },
        { label: 'Work Orders', href: '/work-orders' },
        { label: 'Reports', href: '/reports' },
      ]}
      title="Spare Parts Inventory"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Spare Parts Inventory</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>Add New Part</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Parts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{parts.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {parts.filter((part) => part.quantity <= part.minQuantity).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{uniqueCategories.length - 1}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat || ''}>{cat === 'all' ? 'All Categories' : cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                  Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead onClick={() => handleSort('quantity')} className="cursor-pointer">
                  Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead onClick={() => handleSort('location')} className="cursor-pointer">
                  Location {sortField === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell>{part.name}</TableCell>
                  <TableCell>{part.category}</TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  <TableCell>{part.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant={part.quantity <= part.minQuantity ? 'destructive' : 'default'}
                    >
                      {part.quantity <= part.minQuantity ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPart(part);
                          setFormData(part);
                          setIsUpdateModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePart(part.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Spare Part</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minQuantity" className="text-right">
                  Min Quantity
                </Label>
                <Input
                  id="minQuantity"
                  name="minQuantity"
                  type="number"
                  value={formData.minQuantity || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier" className="text-right">
                  Supplier
                </Label>
                <Input
                  id="supplier"
                  name="supplier"
                  value={formData.supplier || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPart}>Add Part</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Spare Part</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minQuantity" className="text-right">
                  Min Quantity
                </Label>
                <Input
                  id="minQuantity"
                  name="minQuantity"
                  type="number"
                  value={formData.minQuantity || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier" className="text-right">
                  Supplier
                </Label>
                <Input
                  id="supplier"
                  name="supplier"
                  value={formData.supplier || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePart}>Update Part</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SharedLayout>
  );
};

export default SpareParts; 