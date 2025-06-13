export interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  model: string;
  location: string;
  locationDescription?: string;
  status: 'Operational' | 'Needs Maintenance' | 'Out of Service' | 'Decommissioned';
  lastMaintenance?: string;
  nextMaintenance?: string;
  installationDate?: string;
  manufacturer?: string;
  category?: string;
  notes?: string;
  manufacturerName?: string;
  modelNumber?: string;
  manufacturerServiceNumber?: string;
  vendorName?: string;
  vendorCode?: string;
  locationCode?: string;
  purchasePrice?: number;
  warrantyExpirationDate?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
  inventoryNumber: string;
} 