import { Role, Permission } from '../config/permissions';

export type BackendUserRole = 
  | 'admin'
  | 'laboratory technician'
  | 'biomedical engineer'
  | 'engineer for maintenance';

export type FrontendUserRole = 
  | 'Admin'
  | 'LabTechnician'
  | 'BiomedicalEngineer'
  | 'MaintenanceTechnician';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    department?: string;
    permissions: Permission[];
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
  };
}

export const mapToFrontendRole = (role: BackendUserRole): FrontendUserRole => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Admin';
    case 'laboratory technician':
      return 'LabTechnician';
    case 'biomedical engineer':
      return 'BiomedicalEngineer';
    case 'engineer for maintenance':
      return 'MaintenanceTechnician';
    default:
      return 'LabTechnician'; // Default to LabTechnician for unknown roles
  }
};

export const mapToBackendRole = (role: FrontendUserRole): BackendUserRole => {
  switch (role) {
    case 'Admin':
      return 'admin';
    case 'LabTechnician':
      return 'laboratory technician';
    case 'BiomedicalEngineer':
      return 'biomedical engineer';
    case 'MaintenanceTechnician':
      return 'engineer for maintenance';
    default:
      return 'laboratory technician'; // Default to laboratory technician for unknown roles
  }
}; 