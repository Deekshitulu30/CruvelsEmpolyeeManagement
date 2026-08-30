import api from './api';
import type { Employee, PaginatedResponse } from '../types';

interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const employeeService = {
  getAll: async (filters: EmployeeFilters = {}): Promise<PaginatedResponse<Employee>> => {
    const res = await api.get('/employees', { params: filters });
    return res.data;
  },

  getById: async (id: string): Promise<Employee> => {
    const res = await api.get(`/employees/${id}`);
    return res.data;
  },

  getMe: async (): Promise<Employee> => {
    const res = await api.get('/employees/me');
    return res.data;
  },

  create: async (data: Record<string, unknown>): Promise<Employee> => {
    const res = await api.post('/employees', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const res = await api.put(`/employees/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Employee> => {
    const res = await api.patch(`/employees/${id}/status`, { status });
    return res.data;
  },
};
