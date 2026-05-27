import React, { useEffect, useState } from 'react';
import Hero from '../components/events/Hero';
import FilterBar from '../components/events/FilterBar';
import EventGrid from '../components/events/EventGrid';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { getEvents } from '../services/events.service';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getEvents(filter === 'all' ? null : filter)
      .then(({ data }) => setEvents(data.events || []))
      .catch(() => setError('Failed to load events'))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <Hero />
      <FilterBar active={filter} onChange={setFilter} />
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '1px' }}>UPCOMING EVENTS</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{events.length} events</div>
        </div>
        {loading ? <LoadingSpinner /> : error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : <EventGrid events={events} />}
      </div>
    </div>
  );
};

export default EventsPage;
