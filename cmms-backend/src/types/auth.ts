import { Role, Permission } from '../config/permissions';

export type BackendUserRole = Role;

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

export const mapToFrontendRole = (role: BackendUserRole): string => {
  // Convert role to lowercase for comparison
  const roleLower = role.toLowerCase();
  
  switch (roleLower) {
    case 'admin':
      return 'admin';
    case 'biomedical engineer':
      return 'biomedical engineer';
    case 'engineer for maintenance':
      return 'engineer for maintenance';
    case 'laboratory technician':
      return 'laboratory technician';
    default:
      console.error('Unknown role:', role);
      throw new Error(`Unknown role: ${role}`);
  }
}; 