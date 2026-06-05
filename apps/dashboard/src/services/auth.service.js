import axios from 'axios';

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || '';

export const login = async (email, password) => {
  const response = await axios.post(`${ADMIN_API_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('email');
};

export const getToken = () => localStorage.getItem('token');
export const getEmail = () => localStorage.getItem('email');
export const isAuthenticated = () => !!localStorage.getItem('token');
