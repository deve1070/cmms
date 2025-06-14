import { Equipment } from './equipment';
import { User } from './auth';

export interface IssueReport {
  id: string;
  equipmentId: string;
  equipment: Equipment;
  issue: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  reportedById: string;
  reportedBy: User;
  reviewedById?: string;
  reviewedBy?: User;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueReportDto {
  equipmentId: string;
  issue: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
} 