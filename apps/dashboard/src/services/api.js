import axios from 'axios';
import { getToken, logout } from './auth.service';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL || '',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to every admin request
adminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — token expired or invalid
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
