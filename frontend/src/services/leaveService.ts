import api from './api';
import type { LeaveRequest, PaginatedResponse } from '../types';

interface LeaveFilters {
  status?: string;
  empFilter?: string;
  page?: number;
  limit?: number;
}

interface CreateLeaveData {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}

export const leaveService = {
  create: async (data: CreateLeaveData): Promise<LeaveRequest> => {
    const res = await api.post('/leaves', data);
    return res.data;
  },

  getMyLeaves: async (filters: LeaveFilters = {}): Promise<PaginatedResponse<LeaveRequest>> => {
    const res = await api.get('/leaves/me', { params: filters });
    return res.data;
  },

  getAllLeaves: async (filters: LeaveFilters = {}): Promise<PaginatedResponse<LeaveRequest>> => {
    const res = await api.get('/leaves', { params: filters });
    return res.data;
  },

  approve: async (id: string): Promise<LeaveRequest> => {
    const res = await api.patch(`/leaves/${id}/approve`);
    return res.data;
  },

  reject: async (id: string): Promise<LeaveRequest> => {
    const res = await api.patch(`/leaves/${id}/reject`);
    return res.data;
  },

  cancel: async (id: string): Promise<LeaveRequest> => {
    const res = await api.patch(`/leaves/${id}/cancel`);
    return res.data;
  },
};

