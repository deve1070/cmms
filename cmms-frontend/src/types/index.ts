export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'Operational' | 'Needs Maintenance' | 'Out of Service';
  location: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  notes?: string;
} 