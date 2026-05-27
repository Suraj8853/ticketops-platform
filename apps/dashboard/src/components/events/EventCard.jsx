import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const isSoldOut = event.available_seats == 0 || event.status === 'sold';
  const isFew = !isSoldOut && event.available_seats < 50;

  const tagLabel = isSoldOut ? 'Sold Out' : isFew ? 'Few Left' : event.category;
  const tagColor = isSoldOut ? 'var(--danger)' : isFew ? '#e8a347' : 'var(--accent)';
  const tagBorder = isSoldOut ? 'rgba(224,85,85,0.3)' : isFew ? 'rgba(232,163,71,0.3)' : 'rgba(232,197,71,0.3)';

  return (
    <div onClick={() => navigate(`/events/${event.id}`)}
      style={{
        background: 'var(--bg2)', padding: '1.5rem',
        cursor: 'pointer', transition: 'background 0.2s',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg2)'}
    >
      <div style={{
        display: 'inline-block', fontSize: '10px', letterSpacing: '2px',
        textTransform: 'uppercase', color: tagColor,
        border: `1px solid ${tagBorder}`, padding: '3px 8px',
        borderRadius: '3px', marginBottom: '1rem',
      }}>{tagLabel}</div>

      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '0.5rem', letterSpacing: '1px' }}>
        {new Date(event.event_date).toDateString()}
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '1px', marginBottom: '0.5rem', lineHeight: 1.1 }}>
        {event.title}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '1.25rem' }}>
        {event.venue}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>from</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--accent)' }}>
            {event.price == 0 ? 'FREE' : `₹${Number(event.price).toLocaleString()}`}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>
            {isSoldOut ? 'Sold out' : event.available_seats?.toLocaleString()}
          </strong><br />
          {!isSoldOut && 'seats left'}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
