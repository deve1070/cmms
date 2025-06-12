import axios from 'axios';
import { User, LoginCredentials, LoginResponse } from '../types/auth';
import { Budget } from '../types/budget';
import { ComplianceRequirement } from '../types/compliance';
import { Contract } from '../types/contract';

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
      localStorage.removeItem('token');
      window.location.href = '/login';
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
  getAll: async () => {
    const response = await api.get('/equipment');
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
  getAll: async () => {
    const response = await api.get('/work-orders');
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
};

// Reports API
export const reportsApi = {
  // Existing methods (if any specific ones like getPerformance/getCompliance are still needed, keep them)
  // For this subtask, focusing on generic report management and specific generation endpoints.
  // The generic create might be removed if all reports are generated via specific functions.

  getAll: async () => {
    const response = await api.get('/reports');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  // Generic create - might be deprecated if all reports are system-generated via specific functions
  create: async (data: {
    type: string;
    title: string;
    content: string; // Should be JSON string
    period: string;
    metrics: Record<string, any>; // Should be JSON string
    // generatedBy will be set by backend from token
  }) => {
    const response = await api.post('/reports', data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },
  generateDowntimeReport: async (data: { periodStart: string; periodEnd: string }) => {
    const response = await api.post('/reports/generate/downtime', data);
    return response.data;
  },
  generateMaintenanceCostsReport: async (data: { periodStart: string; periodEnd: string }) => {
    const response = await api.post('/reports/generate/maintenance-costs', data);
    return response.data;
  },
  generateStaffEfficiencyReport: async (data: { periodStart: string; periodEnd: string }) => {
    const response = await api.post('/reports/generate/staff-efficiency', data);
    return response.data;
  }
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
  updateStatus: (id: string, status: string) => api.patch(`/contracts/${id}/status`, { status }).then(res => res.data as Contract),
  updateExpiringStatuses: async () => { // Added method
    const response = await api.post('/contracts/update-expiring-statuses');
    return response.data;
  }
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
  getAll: async (params: any) => {
    const response = await api.get('/maintenance', { params });
    return response.data;
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
  },
};

// Spare Parts API
export const sparePartsApi = {
  getAll: () => api.get('/spare-parts').then(res => res.data),
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

// Schedules API (for Preventive Maintenance Schedules)
export const schedulesApi = {
  getAll: async () => {
    const response = await api.get('/schedules');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },
  create: async (data: any) => { // Consider defining a specific type for schedule creation data
    const response = await api.post('/schedules', data);
    return response.data;
  },
  update: async (id: string, data: any) => { // Consider defining a specific type for schedule update data
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
  generateWorkOrders: async () => {
    const response = await api.post('/schedules/generate-work-orders');
    return response.data;
  }
};

export default api;