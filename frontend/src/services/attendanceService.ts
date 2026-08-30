import api from './api';
import type { Attendance, PaginatedResponse } from '../types';

interface AttendanceFilters {
  startDate?: string;
  endDate?: string;
  empFilter?: string;
  page?: number;
  limit?: number;
}

export const attendanceService = {
  checkIn: async (): Promise<Attendance> => {
    const res = await api.post('/attendance/check-in');
    return res.data;
  },

  checkOut: async (): Promise<Attendance> => {
    const res = await api.post('/attendance/check-out');
    return res.data;
  },

  getMyAttendance: async (filters: AttendanceFilters = {}): Promise<PaginatedResponse<Attendance>> => {
    const res = await api.get('/attendance/me', { params: filters });
    return res.data;
  },

  getTeamAttendance: async (filters: AttendanceFilters = {}): Promise<PaginatedResponse<Attendance>> => {
    const res = await api.get('/attendance/team', { params: filters });
    return res.data;
  },

  getAllAttendance: async (filters: AttendanceFilters = {}): Promise<PaginatedResponse<Attendance>> => {
    const res = await api.get('/attendance', { params: filters });
    return res.data;
  },
};
