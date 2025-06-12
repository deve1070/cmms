export type UserRole = 'Admin' | 'Engineer' | 'Technician' | 'LAB_TECH';

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: UserRole;
  department?: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
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
}

export interface LoginResponse {
  token: string;
  user: User;
} 