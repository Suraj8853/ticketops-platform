import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SeatMap from '../components/booking/SeatMap';
import BookingPanel from '../components/booking/BookingPanel';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { getEvent, getSeats } from '../services/events.service';
import useStore from '../store/useStore';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clearSeats } = useStore();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearSeats();
    Promise.all([getEvent(id), getSeats(id)])
      .then(([evtRes, seatsRes]) => {
        setEvent(evtRes.data);
        setSeats(seatsRes.data.seats || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: '1px solid var(--border2)', color: 'var(--muted)', padding: '6px 16px', borderRadius: '4px', fontSize: '13px' }}>
          ← Back to events
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', minHeight: 'calc(100vh - 113px)' }}>
        <div style={{ padding: '2.5rem 2rem', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>{event?.category}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '56px', letterSpacing: '2px', lineHeight: 1, marginBottom: '0.75rem' }}>{event?.title}</div>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
            {[
              ['Date', new Date(event?.event_date).toDateString()],
              ['Venue', event?.venue],
              ['From', event?.price == 0 ? 'Free' : `₹${Number(event?.price).toLocaleString()}`],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
                <div style={{ fontSize: '15px', marginTop: '3px' }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '1px', marginBottom: '1rem' }}>SELECT YOUR SEATS</div>
          <SeatMap seats={seats} eventId={id} />
        </div>

        <div style={{ position: 'sticky', top: '56px', height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
          <BookingPanel event={event} />
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
