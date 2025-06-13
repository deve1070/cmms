import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LoginCredentials, AuthState } from '../types/auth';
import { login as apiLogin } from '../services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isLoading) {
      const currentPath = location.pathname;
      const isPublicRoute = ['/login', '/welcome'].includes(currentPath);

      if (!isAuthenticated && !isPublicRoute) {
        navigate('/login', { replace: true });
      } else if (isAuthenticated && isPublicRoute) {
        const userRole = user?.role.toLowerCase();
        console.log('User role:', userRole); // Debug log
        const dashboardPath = userRole === 'admin' ? '/admin/dashboard' :
                            userRole === 'engineer for maintenance' ? '/maintenance/dashboard' :
                            userRole === 'laboratory technician' ? '/lab/dashboard' :
                            userRole === 'biomedical engineer' ? '/biomedical/dashboard' :
                            '/welcome';
        console.log('Redirecting to:', dashboardPath); // Debug log
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate, user?.role]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiLogin(credentials);
      const { token, user } = response;
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);

      // Get the correct dashboard path
      const userRole = user.role.toLowerCase();
      const dashboardPath = userRole === 'admin' ? '/admin/dashboard' :
                          userRole === 'engineer for maintenance' ? '/maintenance/dashboard' :
                          userRole === 'laboratory technician' ? '/lab/dashboard' :
                          userRole === 'biomedical engineer' ? '/biomedical/dashboard' :
                          '/welcome';
      
      // Navigate to dashboard
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, error, login, logout }}>
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