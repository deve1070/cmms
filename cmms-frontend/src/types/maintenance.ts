export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  type: 'preventive' | 'corrective';
  status: 'pending' | 'in_progress' | 'completed';
  scheduledDate: string;
  description: string;
  assignedTo?: string;
  completedAt?: string;
  notes?: string;
  equipment?: {
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    location: string;
  };
}

export interface MaintenanceReport {
  id: string;
  equipmentId: string;
  type: 'preventive' | 'corrective' | 'emergency';
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
  performedBy: string;
  date: string;
  startDate?: string;
  endDate?: string;
  cost?: number;
  partsUsed?: string;
  title?: string;
  technician?: string;
  equipmentName?: string;
  findings?: string;
  recommendations?: string;
  equipment: {
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    location: string;
  };
}

// Alias for backward compatibility
export type MaintenanceRecord = MaintenanceReport; 