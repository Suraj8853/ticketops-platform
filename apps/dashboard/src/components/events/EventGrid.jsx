import React from 'react';
import EventCard from './EventCard';

const EventGrid = ({ events }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1px', border: '1px solid var(--border)',
  }}>
    {events.map((event) => <EventCard key={event.id} event={event} />)}
  </div>
);

export default EventGrid;
