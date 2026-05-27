import { useState, useEffect } from 'react';
import { getEvents, getEvent, getSeats } from '../services/events.service';

export const useEvents = (category) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getEvents(category === 'all' ? null : category)
      .then(({ data }) => setEvents(data.events || []))
      .catch(() => setError('Failed to load events'))
      .finally(() => setLoading(false));
  }, [category]);

  return { events, loading, error };
};

export const useEvent = (id) => {
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getEvent(id), getSeats(id)])
      .then(([evtRes, seatsRes]) => {
        setEvent(evtRes.data);
        setSeats(seatsRes.data.seats || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { event, seats, loading };
};
