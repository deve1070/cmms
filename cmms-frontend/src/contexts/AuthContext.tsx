import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { 
  FrontendUser, 
  BackendUser, 
  mapBackendUserToFrontend, 
  mapFrontendUserToBackend,
  getUserDisplayName 
} from '../types/auth';

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
      const frontendUser = mapBackendUserToFrontend(user);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(frontendUser));
      setUser(frontendUser);
      toast.success('Login successful');

      // Redirect based on role
      switch (frontendUser.role) {
        case 'Admin':
          navigate('/admin/dashboard');
          break;
        case 'BiomedicalEngineer':
          navigate('/biomedical/dashboard');
          break;
        case 'LabTechnician':
          navigate('/lab/dashboard');
          break;
        case 'MaintenanceTechnician':
          navigate('/maintenance/dashboard');
          break;
        default:
          navigate('/dashboard');
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