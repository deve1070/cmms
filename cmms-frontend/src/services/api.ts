import axios from 'axios';
import { User, LoginCredentials, LoginResponse } from '../types/auth';
import { Budget } from '../types/budget';
import { ComplianceRequirement } from '../types/compliance';
import { Contract } from '../types/contract';
import { Equipment } from '../types/equipment';
import { WorkOrder } from '../types/workOrder';
import { MaintenanceSchedule, MaintenanceReport } from '../types/maintenance';
import { SparePart } from '../types/sparePart';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear auth if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
  }
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
      console.log('Fetching maintenance reports with params:', params);
      const response = await api.get('/maintenance', { params });
      console.log('Maintenance reports response:', response);
      const data = response.data as any[];
      return data.map((report) => ({
        ...report,
        findings: report.findings || '',
        recommendations: report.recommendations || '',
        equipment: {
          id: report.equipmentId,
          name: report.equipment?.name || 'Unknown',
          model: report.equipment?.model || 'Unknown',
          serialNumber: report.equipment?.serialNumber || 'Unknown',
          location: report.equipment?.location || 'Unknown'
        }
      }));
    } catch (error) {
      console.error('Error in maintenanceApi.getAll:', error);
      throw error;
    }
  },
  getById: async (id: string) => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/maintenance', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
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

export default api;