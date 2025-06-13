export interface SparePart {
  id: string;
  name: string;
  quantity: number;
  minimumQuantity: number;
  unit: string;
  location: string;
  category?: string;
  supplier?: string;
  unitCost?: number;
  lastUpdated?: string;
  notes?: string;
  minOrderQty?: number;
  leadTime?: number;
  equipmentId?: string;
  alert?: string;
} 