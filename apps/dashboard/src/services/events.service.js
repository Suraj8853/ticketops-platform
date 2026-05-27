import { api } from './api';

export const getEvents = (category) =>
  api.get('/api/events', { params: category ? { category } : {} });

export const getEvent = (id) =>
  api.get(`/api/events/${id}`);

export const getSeats = (id) =>
  api.get(`/api/events/${id}/seats`);
