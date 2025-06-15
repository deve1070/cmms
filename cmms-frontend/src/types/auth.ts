// src/types/auth.ts

import { Role } from '../config/permissions';

export type FrontendUserRole = Role;

export type BackendUserRole = 'Admin' | 'BiomedicalEngineer' | 'LabTechnician' | 'MaintenanceTechnician';

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: FrontendUserRole;
  department?: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterCredentials extends LoginCredentials {
  email: string;
  role: BackendUserRole;
}

export const roleMapping: Record<FrontendUserRole, BackendUserRole> = {
  [Role.ADMIN]: 'Admin',
  [Role.BIOMEDICAL_ENGINEER]: 'BiomedicalEngineer',
  [Role.LAB_TECHNICIAN]: 'LabTechnician',
  [Role.MAINTENANCE_TECHNICIAN]: 'MaintenanceTechnician'
};

export const reverseRoleMapping: Record<BackendUserRole, FrontendUserRole> = {
  'Admin': Role.ADMIN,
  'BiomedicalEngineer': Role.BIOMEDICAL_ENGINEER,
  'LabTechnician': Role.LAB_TECHNICIAN,
  'MaintenanceTechnician': Role.MAINTENANCE_TECHNICIAN
};

export interface FrontendUser {
  id: string;
  username: string;
  email: string;
  role: FrontendUserRole;
  permissions: string[];
}

export interface BackendUser {
  id: string;
  username: string;
  email: string;
  role: BackendUserRole;
  permissions: string[];
}

export const mapBackendUserToFrontend = (user: BackendUser): FrontendUser => ({
  ...user,
  role: reverseRoleMapping[user.role]
});

export const mapFrontendUserToBackend = (user: FrontendUser): BackendUser => ({
  ...user,
  role: roleMapping[user.role]
});

export const getUserDisplayName = (user: FrontendUser, fallback: string = 'User'): string => {
  return user.username || user.email || fallback;
};

export const getRoleDisplayName = (role: FrontendUserRole): string => {
  switch (role) {
    case Role.ADMIN:
      return 'Administrator';
    case Role.BIOMEDICAL_ENGINEER:
      return 'Biomedical Engineer';
    case Role.LAB_TECHNICIAN:
      return 'Lab Technician';
    case Role.MAINTENANCE_TECHNICIAN:
      return 'Maintenance Technician';
    default:
      return 'User';
  }
};