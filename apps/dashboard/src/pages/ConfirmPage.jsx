import React from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

const ConfirmPage = () => {
  const { lastBooking } = useStore();

  if (!lastBooking) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
      No booking found. <Link to="/" style={{ color: 'var(--accent)' }}>Browse events</Link>
    </div>
  );

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '48px', marginBottom: '1.5rem' }}>🎫</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', letterSpacing: '2px', color: 'var(--success)', marginBottom: '0.5rem' }}>BOOKING CONFIRMED</div>
      <div style={{ color: 'var(--muted)', marginBottom: '2.5rem', fontSize: '15px' }}>
        Your tickets are being processed. QR codes will be generated and uploaded to S3 by the bookings-worker service.
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg3)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Booking ID</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '2px' }}>{lastBooking.booking_ref}</div>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {[
            ['Event', lastBooking.event?.title],
            ['Venue', lastBooking.event?.venue],
            ['Seats', lastBooking.seats?.join(', ')],
            ['Total', lastBooking.event?.price == 0 ? 'Free' : `₹${Number(lastBooking.total_amount).toLocaleString()}`],
            ['Status', lastBooking.status],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
              <span style={{ color: 'var(--muted)' }}>{label}</span>
              <span>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" style={{ flex: 1, padding: '12px', background: 'var(--accent)', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 500 }}>
          Browse more events
        </Link>
        <Link to="/admin" style={{ flex: 1, padding: '12px', border: '1px solid var(--border2)', borderRadius: '4px', textAlign: 'center' }}>
          View in admin panel
        </Link>
      </div>
    </div>
  );
};

export default ConfirmPage;
