export interface Contract {
  id: string;
  title: string;
  type: 'preventive' | 'corrective' | 'consulting';
  vendor: string;
  equipmentId: string;
  equipment: {
    id: string;
    model: string;
    serialNumber: string;
  };
  startDate: string;
  endDate: string;
  details: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  value: number;
  renewalDate?: string;
  renewalTerms: string;
  paymentTerms: string;
  terms: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
} 