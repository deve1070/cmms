import axios from 'axios';
import { User, LoginCredentials, LoginResponse, FrontendUserRole, mapFrontendUserToBackend, FrontendUser } from '../types/auth';
import { Budget } from '../types/budget';
import { ComplianceRequirement } from '../types/compliance';
import { Contract } from '../types/contract';
import { Equipment } from '../types/equipment';
import { WorkOrder } from '../types/workOrder';
import { MaintenanceReport } from '../types/maintenance';
import { SparePart } from '../types/sparePart';
import { IssueReport, CreateIssueReportDto } from '../types/issueReport';
import { toast } from 'react-hot-toast';

const API_URL = '/api'; // Use relative URL to work with proxy

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If there's data in the request and it contains a role, map it to backend format
    if (config.data && typeof config.data === 'object' && 'role' in config.data) {
      const userData = config.data as FrontendUser;
      config.data = {
        ...config.data,
        role: mapFrontendUserToBackend(userData).role
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401/403 and we haven't retried yet
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using GET request
        const response = await api.get<{ token: string }>('/auth/refresh');
        const { token } = response.data;
        
        // Update token in localStorage
        localStorage.setItem('token', token);
        
        // Update the original request's authorization header
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Only clear auth data and redirect if we're not already on the login page
        // and if the request is not a retry
        if (!window.location.pathname.includes('/login') && !originalRequest._isRetry) {
          // Show error message before redirecting
          toast.error('Your session has expired. Please log in again.');
          
          // Clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
        
        return Promise.reject(refreshError);
      }
    }

    // For other errors, show the error message from the response
    if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else {
      toast.error('An error occurred. Please try again.');
    }

    return Promise.reject(error);
  }
);

// Login function
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  return response.data;
};

// Equipment API
export const equipmentApi = {
  getAll: async (): Promise<Equipment[]> => {
    const response = await api.get<Equipment[]>('/equipment');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/equipment', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/equipment/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/equipment/${id}`);
    return response.data;
  },
  getMaintenanceHistory: async (id: string) => {
    const response = await api.get(`/equipment/${id}/maintenance`);
    return response.data;
  },
};

// Work Orders API
export const workOrdersApi = {
  getAll: async (): Promise<WorkOrder[]> => {
    const response = await api.get<WorkOrder[]>('/work-orders');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/work-orders/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/work-orders', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/work-orders/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/work-orders/${id}`);
    return response.data;
  },
  logPartUsage: async (workOrderId: string, partId: string, quantity: number) => {
    const response = await api.post(`/work-orders/${workOrderId}/parts`, {
      partId,
      quantity
    });
    return response.data;
  },
  getUserActivities: () => {
    return api.get('/work-orders/activities');
  },
};

// Reports API
export const reportsApi = {
  getPerformance: (params: { startDate?: string; endDate?: string; equipmentId?: string }) =>
    api.get('/reports/performance', { params }).then(res => res.data),
  getCompliance: (params: { standard?: string; status?: string }) =>
    api.get('/reports/compliance', { params }).then(res => res.data),
  create: (data: {
    type: string;
    title: string;
    content: string;
    period: string;
    metrics: Record<string, any>;
  }) => api.post('/reports', data).then(res => res.data),
  delete: (id: string) => api.delete(`/reports/${id}`).then(res => res.data)
};

// Budgets API
export const budgetsApi = {
  getAll: () => api.get('/budgets').then(res => res.data as Budget[]),
  getById: (id: string) => api.get(`/budgets/${id}`).then(res => res.data as Budget),
  create: (data: any) => api.post('/budgets', data).then(res => res.data as Budget),
  update: (id: string, data: any) => api.put(`/budgets/${id}`, data).then(res => res.data as Budget),
  delete: (id: string) => api.delete(`/budgets/${id}`).then(res => res.data)
};

// Compliance API
export const complianceApi = {
  getAll: () => api.get('/compliance').then(res => res.data as ComplianceRequirement[]),
  getById: (id: string) => api.get(`/compliance/${id}`).then(res => res.data as ComplianceRequirement),
  create: (data: any) => api.post('/compliance', data).then(res => res.data as ComplianceRequirement),
  update: (id: string, data: any) => api.put(`/compliance/${id}`, data).then(res => res.data as ComplianceRequirement),
  delete: (id: string) => api.delete(`/compliance/${id}`).then(res => res.data)
};

// Contracts API
export const contractsApi = {
  getAll: () => api.get('/contracts').then(res => res.data as Contract[]),
  getById: (id: string) => api.get(`/contracts/${id}`).then(res => res.data as Contract),
  create: (data: any) => api.post('/contracts', data).then(res => res.data as Contract),
  update: (id: string, data: any) => api.put(`/contracts/${id}`, data).then(res => res.data as Contract),
  delete: (id: string) => api.delete(`/contracts/${id}`).then(res => res.data),
  updateStatus: (id: string, status: string) => api.patch(`/contracts/${id}/status`, { status }).then(res => res.data as Contract)
};

// Users API
export const usersApi = {
  getAll: () => api.get('/users').then(res => res.data as User[]),
  getById: (id: string) => api.get(`/users/${id}`).then(res => res.data as User),
  create: (data: any) => api.post('/users', data).then(res => res.data as User),
  update: (id: string, data: any) => api.put(`/users/${id}`, data).then(res => res.data as User),
  delete: (id: string) => api.delete(`/users/${id}`).then(res => res.data),
  updateStatus: (id: string, status: string) => api.patch(`/users/${id}/status`, { status }).then(res => res.data as User),
  updateRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }).then(res => res.data as User)
};

// Maintenance History API
export const maintenanceApi = {
  getAll: async (params?: Record<string, any>): Promise<MaintenanceReport[]> => {
    try {
      const response = await api.get('/maintenance', { params });
      const data = response.data as any[];
      return data.map((report) => ({
        ...report,
        findings: report.findings || '',
        recommendations: report.recommendations || '',
        equipment: {
          id: report.equipmentId,
          name: report.equipment?.name || 'Unknown Equipment',
          serialNumber: report.equipment?.serialNumber || 'N/A'
        }
      }));
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
      throw error;
    }
  },
  getById: async (id: string): Promise<MaintenanceReport> => {
    const response = await api.get<MaintenanceReport>(`/maintenance/${id}`);
    return response.data;
  },
  create: async (data: any): Promise<MaintenanceReport> => {
    const response = await api.post<MaintenanceReport>('/maintenance', data);
    return response.data;
  },
  update: async (id: string, data: any): Promise<MaintenanceReport> => {
    const response = await api.put<MaintenanceReport>(`/maintenance/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/maintenance/${id}`);
  }
};

// Spare Parts API
export const sparePartsApi = {
  getAll: async (): Promise<SparePart[]> => {
    const response = await api.get<SparePart[]>('/spare-parts');
    return response.data;
  },
  getById: (id: string) => api.get(`/spare-parts/${id}`).then(res => res.data),
  create: (data: {
    name: string;
    quantity: number;
    threshold: number;
    category: string;
    unitCost: number;
    supplier?: string;
    location: string;
    minOrderQty: number;
    leadTime: number;
  }) => api.post('/spare-parts', data).then(res => res.data),
  update: (id: string, data: {
    name?: string;
    quantity?: number;
    threshold?: number;
    category?: string;
    unitCost?: number;
    supplier?: string;
    location?: string;
    minOrderQty?: number;
    leadTime?: number;
  }) => api.put(`/spare-parts/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/spare-parts/${id}`).then(res => res.data)
};

// Issue Reports API
export const issueReportsApi = {
  getAll: async (): Promise<IssueReport[]> => {
    const response = await api.get<IssueReport[]>('/issue-reports');
    return response.data;
  },
  getById: async (id: string): Promise<IssueReport> => {
    const response = await api.get<IssueReport>(`/issue-reports/${id}`);
    return response.data;
  },
  create: async (data: CreateIssueReportDto & { status: string; reportedById: string }): Promise<IssueReport> => {
    const response = await api.post<IssueReport>('/issue-reports', data);
    return response.data;
  },
  update: async (id: string, data: Partial<IssueReport>): Promise<IssueReport> => {
    const response = await api.put<IssueReport>(`/issue-reports/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/issue-reports/${id}`);
  }
};

export default api;