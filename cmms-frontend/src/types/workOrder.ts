export interface WorkOrder {
  id: string;
  title: string;
  equipmentId: string;
  equipmentName: string;
  description: string;
  issue?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  dueDate: string;
  notes?: string;
  type: 'preventive' | 'corrective' | 'inspection' | 'calibration' | 'repair';
  partsUsed?: Array<{
    partId: string;
    quantity: number;
  }>;
} 