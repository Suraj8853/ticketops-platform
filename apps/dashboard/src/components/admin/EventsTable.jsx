import React from 'react';
import StatusBadge from '../shared/StatusBadge';

const EventsTable = ({ events }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>All Events ({events.length})</div>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {['Event', 'Date', 'Category', 'Price', 'Seats', 'Revenue', 'Status'].map((h) => (
            <th key={h} style={{ padding: '10px 1.25rem', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.id} style={{ transition: 'background 0.15s' }}
            onMouseEnter={(el) => el.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={(el) => el.currentTarget.style.background = 'transparent'}>
            <td style={{ padding: '12px 1.25rem', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{e.title}</td>
            <td style={{ padding: '12px 1.25rem', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{new Date(e.event_date).toDateString()}</td>
            <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{e.category}</td>
            <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{e.price == 0 ? 'Free' : `₹${Number(e.price).toLocaleString()}`}</td>
            <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{e.total_seats}</td>
            <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)', color: 'var(--accent)' }}>₹{Number(e.revenue || 0).toLocaleString()}</td>
            <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}><StatusBadge status={e.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EventsTable;
