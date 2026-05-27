import { adminApi } from './api';

export const getAdminEvents = () => adminApi.get('/admin/events');
export const createEvent = (data) => adminApi.post('/admin/events', data);
export const updateEvent = (id, data) => adminApi.put(`/admin/events/${id}`, data);
export const cancelEvent = (id) => adminApi.delete(`/admin/events/${id}`);
export const getAdminBookings = (params) => adminApi.get('/admin/bookings', { params });
export const getReports = () => adminApi.get('/admin/bookings/reports');
