import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { createBooking } from '../../services/bookings.service';

const BookingPanel = ({ event }) => {
  const navigate = useNavigate();
  const { selectedSeats, clearSeats, setLastBooking, removeSeat } = useStore();
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const price = Number(event?.price || 0);
  const subtotal = selectedSeats.length * price;
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;

  const handleBook = async () => {
    if (!form.name || !form.email) return setError('Name and email required');
    setLoading(true);
    setError('');
    try {
      const { data } = await createBooking({
        event_id: event.id,
        customer_name: form.name,
        customer_email: form.email,
        seats: selectedSeats,
      });
      setLastBooking({ ...data.booking, event });
      clearSeats();
      navigate('/confirm');
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '1px' }}>YOUR ORDER</div>

      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1rem', minHeight: '80px' }}>
        {selectedSeats.length === 0
          ? <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No seats selected yet. Click on seats to add them.</div>
          : selectedSeats.map((s) => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', margin: '3px' }}>
              {s}
              <span onClick={() => removeSeat(s)} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: '14px' }}>×</span>
            </span>
          ))
        }
      </div>

      {selectedSeats.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input placeholder="Your name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '4px', color: 'var(--text)', fontSize: '13px' }}
            />
            <input placeholder="Email address" value={form.email} type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ padding: '10px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '4px', color: 'var(--text)', fontSize: '13px' }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            {[
              [`${selectedSeats.length} × ticket${selectedSeats.length > 1 ? 's' : ''}`, price === 0 ? 'Free' : `₹${subtotal.toLocaleString()}`],
              ['Convenience fee', price === 0 ? '₹0' : `₹${fee.toLocaleString()}`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                <span style={{ color: 'var(--muted)' }}>{label}</span><span>{val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
              <span style={{ fontWeight: 500 }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--accent)' }}>
                {price === 0 ? 'Free' : `₹${total.toLocaleString()}`}
              </span>
            </div>
          </div>
        </>
      )}

      {error && <div style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</div>}

      <button disabled={selectedSeats.length === 0 || loading} onClick={handleBook}
        style={{
          background: selectedSeats.length === 0 ? 'var(--bg4)' : 'var(--accent)',
          color: selectedSeats.length === 0 ? 'var(--muted)' : '#000',
          border: 'none', padding: '14px', borderRadius: '4px',
          fontSize: '14px', fontWeight: 500, width: '100%',
          cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer',
        }}>
        {loading ? 'Processing...' : selectedSeats.length === 0 ? 'Select seats to continue' : 'Confirm booking →'}
      </button>

      <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
        Seats held for 10 minutes via Redis. CronJob releases expired holds every 5 minutes.
      </div>
    </div>
  );
};

export default BookingPanel;
