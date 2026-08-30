import api from './api';
import type { User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  ssoLogin: async (email: string, provider: string): Promise<{ access_token: string; user: User }> => {
    const res = await api.post('/auth/sso-login', { email, provider });
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<{ id: string; email: string; role: string; employee: unknown }> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
