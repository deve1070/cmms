export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  standard: string;
  category: string;
  requirement: string;
  status: 'expired' | 'pending' | 'compliant' | 'non-compliant';
  dueDate: string;
  lastChecked: string;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
} 