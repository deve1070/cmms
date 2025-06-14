export interface WorkOrder {
  id: string;
  equipmentId: string;
  equipment: {
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    location: string;
  };
  issue: string;
  type: 'Preventive' | 'Corrective' | 'Calibration' | 'Inspection' | 'Issue Report';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Reported' | 'Assigned' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  description?: string;
  reportedById: string;
  reportedBy: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  partsUsed: string;
  estimatedCost?: number;
  actualCost?: number;
  startDate?: string;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
} 