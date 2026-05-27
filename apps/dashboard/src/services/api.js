import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-admin-api-key': import.meta.env.VITE_ADMIN_API_KEY || 'supersecretadminapikey',
  },
});
