import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LoginCredentials, mapToFrontendRole } from '../types/auth';

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

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = 'http://localhost:3002';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user.token;

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        role: response.user.role
      };
      console.log('Mapped user data:', mappedUser);

      setUser(mappedUser);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      localStorage.setItem('token', response.token);
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