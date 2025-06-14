import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LoginCredentials, 
  FrontendUserRole, 
  BackendUserRole,
  mapToFrontendRole,
  mapToBackendRole 
} from '../types/auth';

const API_URL = 'http://localhost:3002';

interface LoginResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuthError = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required') {
        throw error;
      }
      console.error('API request error:', error);
      throw new Error('Failed to make API request');
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const data = await apiRequest('/api/auth/check');
      const userData: User = {
        ...data.user,
        role: mapToFrontendRole(data.user.role),
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Auth check error:', err);
      handleAuthError();
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthError]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      console.log('Making login request with credentials:', credentials);
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }) as LoginResponse;
      console.log('Received login response:', response);

      const mappedUser = {
        ...response.user,
        role: mapToFrontendRole(response.user.role as BackendUserRole)
      };
      console.log('Mapped user data:', mappedUser);

      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      localStorage.setItem('token', response.token);

      // Role-based redirection
      switch (mappedUser.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'biomedical engineer':
          navigate('/biomed');
          break;
        case 'laboratory technician':
          navigate('/lab-tech');
          break;
        case 'maintenance technician':
          navigate('/maintenance');
          break;
        default:
          navigate('/unauthorized');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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