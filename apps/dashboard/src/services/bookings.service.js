import { api } from './api';

export const createBooking = (data) =>
  api.post('/api/bookings', data);

export const getBooking = (ref) =>
  api.get(`/api/bookings/${ref}`);

export const cancelBooking = (ref) =>
  api.post(`/api/bookings/${ref}/cancel`);
