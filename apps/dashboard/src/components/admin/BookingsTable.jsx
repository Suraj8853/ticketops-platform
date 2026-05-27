import React from 'react';
import StatusBadge from '../shared/StatusBadge';

const BookingsTable = ({ bookings }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>All Bookings ({bookings.length})</div>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {['Booking ID', 'Event', 'Customer', 'Seats', 'Total', 'Status'].map((h) => (
            <th key={h} style={{ padding: '10px 1.25rem', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b.id}>
            <td style={{ padding: '12px 1.25rem', fontFamily: 'monospace', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>{b.booking_ref}</td>
            <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{b.event_title}</td>
            <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{b.customer_name}</td>
            <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{b.seats?.join(', ')}</td>
            <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)', color: 'var(--accent)' }}>₹{Number(b.total_amount).toLocaleString()}</td>
            <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}><StatusBadge status={b.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default BookingsTable;
