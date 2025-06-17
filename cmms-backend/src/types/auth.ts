import { Role, Permission } from '../config/permissions';

export type BackendUserRole = 
  | 'Admin'
  | 'LabTechnician'
  | 'BiomedicalEngineer'
  | 'MaintenanceTechnician';

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
  switch (role) {
    case 'Admin':
      return 'Admin';
    case 'LabTechnician':
      return 'LabTechnician';
    case 'BiomedicalEngineer':
      return 'BiomedicalEngineer';
    case 'MaintenanceTechnician':
      return 'MaintenanceTechnician';
    default:
      throw new Error(`Unknown role: ${role}`);
  }
};

export const mapToBackendRole = (role: FrontendUserRole): BackendUserRole => {
  switch (role) {
    case 'Admin':
      return 'Admin';
    case 'LabTechnician':
      return 'LabTechnician';
    case 'BiomedicalEngineer':
      return 'BiomedicalEngineer';
    case 'MaintenanceTechnician':
      return 'MaintenanceTechnician';
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}; 