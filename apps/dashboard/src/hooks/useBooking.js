import { useState } from 'react';
import { createBooking, cancelBooking } from '../services/bookings.service';

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const book = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await createBooking(payload);
      return data.booking;
    } catch (err) {
      const msg = err.response?.data?.error || 'Booking failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (ref) => {
    setLoading(true);
    try {
      await cancelBooking(ref);
    } finally {
      setLoading(false);
    }
  };

  return { book, cancel, loading, error };
};
