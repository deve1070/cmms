export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  equipment: {
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    location: string;
  };
  type: 'Preventive' | 'Corrective' | 'Calibration' | 'Inspection';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  scheduledDate: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceReport {
  id: string;
  equipmentId: string;
  equipment: {
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    location: string;
  };
  type: 'Preventive' | 'Corrective' | 'Calibration' | 'Inspection';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  description: string;
  performedById: string;
  performedBy: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  findings?: string;
  recommendations?: string;
  nextDueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Alias for backward compatibility
export type MaintenanceRecord = MaintenanceReport; 