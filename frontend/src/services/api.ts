import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('ems_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMsg = error.response?.data?.error || '';
      const errorCode = error.response?.data?.code || '';

      const isConcurrent =
        errorCode === 'CONCURRENT_LOGIN_LOGOUT' ||
        errorMsg.includes('Session invalidated') ||
        errorMsg.includes('another tab') ||
        errorMsg.includes('all devices');

      sessionStorage.removeItem('ems_token');
      sessionStorage.removeItem('ems_user');

      if (isConcurrent) {
        window.dispatchEvent(
          new CustomEvent('cruvels_concurrent_logout', {
            detail: {
              message: errorMsg || 'You have been logged out because this account was logged into from another tab or another device.'
            }
          })
        );
      } else if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
