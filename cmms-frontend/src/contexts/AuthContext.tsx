import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { 
  User as BackendUser, 
  mapBackendUserToFrontend, 
  mapFrontendUserToBackend,
  getUserDisplayName,
  FrontendUser
} from '../types/auth';
import { Role } from '../config/permissions';

interface AuthContextType {
  user: FrontendUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FrontendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuthError = (error: any) => {
    console.error('Auth error:', error);
    setError(error.message || 'Authentication failed');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await api.get<BackendUser>('/auth/me');
      const frontendUser = mapBackendUserToFrontend(response.data);
      setUser(frontendUser);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('Making login request with:', { username, password });
      const response = await api.post<{ token: string; user: BackendUser }>('/auth/login', {
        username,
        password
      });

      console.log('Login response:', response.data);
      const { token, user } = response.data;
      console.log('Backend user role:', user.role);
      const frontendUser = mapBackendUserToFrontend(user);
      console.log('Mapped frontend user role:', frontendUser.role);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(frontendUser));
      setUser(frontendUser);
      toast.success('Login successful');

      // Redirect based on role
      console.log('Redirecting based on role:', frontendUser.role);
      switch (frontendUser.role) {
        case Role.ADMIN:
          console.log('Redirecting to admin dashboard');
          navigate('/admin/dashboard');
          break;
        case Role.BIOMEDICAL_ENGINEER:
          console.log('Redirecting to biomedical dashboard');
          navigate('/biomedical/dashboard');
          break;
        case Role.LAB_TECHNICIAN:
          console.log('Redirecting to lab tech dashboard');
          navigate('/lab/dashboard');
          break;
        case Role.MAINTENANCE_TECHNICIAN:
          console.log('Redirecting to maintenance dashboard');
          navigate('/maintenance/dashboard');
          break;
        default:
          console.log('Redirecting to welcome page');
          navigate('/welcome');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
    user,
        isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};