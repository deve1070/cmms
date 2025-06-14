// src/types/auth.ts

export type FrontendUserRole = 
  | 'admin'
  | 'biomedical engineer'
  | 'laboratory technician'
  | 'engineer for maintenance';

export type BackendUserRole = 'admin' | 'biomedical engineer' | 'laboratory technician' | 'engineer for maintenance';

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

// Role mappings with exhaustive type checking
export const roleMapping: Record<FrontendUserRole, BackendUserRole> = {
  'admin': 'admin',
  'biomedical engineer': 'biomedical engineer',
  'laboratory technician': 'laboratory technician',
  'engineer for maintenance': 'engineer for maintenance'
};

export const mapToBackendRole = (role: FrontendUserRole): BackendUserRole => {
  return roleMapping[role];
};

export const mapToFrontendRole = (role: BackendUserRole): FrontendUserRole => {
  return role as FrontendUserRole;
};

export const getUserDisplayName = (user?: User | null, customFallback?: string): string => {
  if (!user) return customFallback || 'User';
  
  const roleFallback = user.role === 'biomedical engineer' ? 'Biomedical Engineer' :
                     user.role === 'engineer for maintenance' ? 'Maintenance Technician' :
                     user.role === 'laboratory technician' ? 'Lab Technician' : 'Administrator';
  
  return user.username || user.email || customFallback || roleFallback;
};

export const getUserRoleDisplayName = (role: FrontendUserRole): string => {
  return role === 'biomedical engineer' ? 'Biomedical Engineer' :
         role === 'engineer for maintenance' ? 'Maintenance Technician' :
         role === 'laboratory technician' ? 'Lab Technician' : 'Administrator';
};