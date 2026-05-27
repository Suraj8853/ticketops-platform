import { useState, useEffect } from 'react';
import { getAdminEvents, getAdminBookings, getReports } from '../services/admin.service';

export const useAdmin = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminEvents(), getAdminBookings(), getReports()])
      .then(([evtRes, bookRes, repRes]) => {
        setEvents(evtRes.data.events || []);
        setBookings(bookRes.data.bookings || []);
        setReports(repRes.data.report || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return { events, bookings, reports, loading };
};
