export interface WorkOrder {
  id: string;
  title: string;
  equipmentId: string;
  equipmentName?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  type?: 'preventive' | 'corrective' | 'calibration' | 'inspection';
  description?: string;
  issue?: string;
  assignedTo?: string;
  reportedBy?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  partsUsed?: Array<{
    partId: string;
    quantity: number;
  }>;
} 