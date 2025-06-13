// Equipment types
export type EquipmentStatus = 'Operational' | 'Needs Maintenance' | 'Out of Service' | 'Decommissioned';

export interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  location: string;
  status: EquipmentStatus;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

// Work Order types
export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';
export type WorkOrderType = 'preventive' | 'corrective';

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  equipmentId: string;
  equipmentName: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  dueDate: string;
  completedAt?: string;
  notes?: string;
}

// Maintenance types
export interface MaintenanceReport {
  id: string;
  equipmentId: string;
  type: 'preventive' | 'corrective';
  description: string;
  performedBy: string;
  date: string;
  cost?: number;
  partsUsed?: string;
  equipment: {
    model: string;
    serialNumber: string;
    location: string;
  };
}

// Spare Part types
export interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  manufacturer: string;
  category: string;
  quantity: number;
  minimumQuantity: number;
  location: string;
  lastRestockedDate?: string;
  notes?: string;
} 