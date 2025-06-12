import axios from 'axios';
import { User, LoginCredentials, LoginResponse } from '../types/auth';
import { Budget } from '../types/budget';
import { ComplianceRequirement } from '../types/compliance';
import { Contract } from '../types/contract';

const api = axios.create({
  baseURL: 'http://localhost:3000',
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

// Login function
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login', credentials);
  return response.data;
};

// Equipment API
export const equipmentApi = {
  getAll: () => api.get('/equipment').then(res => res.data),
  getById: (id: string) => api.get(`/equipment/${id}`).then(res => res.data),
  create: (data: {
    serialNumber: string;
    model: string;
    location: string;
    purchaseDate: string;
    warrantyDetails: string;
    category: string;
    manufacturer: string;
    department: string;
    cost: number;
    status: string;
  }) => api.post('/equipment', data).then(res => res.data),
  update: (id: string, data: {
    serialNumber?: string;
    model?: string;
    location?: string;
    purchaseDate?: string;
    warrantyDetails?: string;
    category?: string;
    manufacturer?: string;
    department?: string;
    cost?: number;
    status?: string;
  }) => api.put(`/equipment/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/equipment/${id}`).then(res => res.data)
};

// Work Orders API
export const workOrdersApi = {
  getAll: () => api.get('/work-orders').then(res => res.data),
  getById: (id: string) => api.get(`/work-orders/${id}`).then(res => res.data),
  create: (data: {
    equipmentId: string;
    issue: string;
    type: string;
    assignedTo: string;
    reportedBy: string;
    actions?: string;
  }) => api.post('/work-orders', data).then(res => res.data),
  update: (id: string, data: {
    status?: string;
    actions?: string;
    completedAt?: string;
  }) => api.put(`/work-orders/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/work-orders/${id}`).then(res => res.data)
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
  getAll: (params: { equipmentId?: string }) =>
    api.get('/equipment/maintenance', { params }).then(res => res.data),
  create: (equipmentId: string, data: {
    type: string;
    description: string;
    performedBy: string;
    date: string;
    cost?: number;
    partsUsed?: string;
  }) => api.post(`/equipment/${equipmentId}/maintenance`, data).then(res => res.data)
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

export default api;