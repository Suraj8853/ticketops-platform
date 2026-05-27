import React from 'react';

const getSeatStyle = (state) => {
  const base = {
    width: '24px', height: '24px',
    borderRadius: '4px 4px 2px 2px',
    border: '1px solid', cursor: 'pointer',
    flexShrink: 0, transition: 'all 0.15s',
  };
  if (state === 'selected') return { ...base, background: 'var(--accent)', borderColor: 'var(--accent)' };
  if (state === 'taken')   return { ...base, background: 'var(--bg4)', borderColor: 'var(--border)', opacity: 0.4, cursor: 'not-allowed' };
  if (state === 'held')    return { ...base, background: 'rgba(232,163,71,0.3)', borderColor: 'rgba(232,163,71,0.5)', cursor: 'not-allowed' };
  return { ...base, background: 'var(--bg3)', borderColor: 'var(--border2)' };
};

const SeatRow = ({ rowLabel, seats, selectedSeats, onToggle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <div style={{ fontSize: '10px', color: 'var(--muted)', width: '16px', textAlign: 'center', flexShrink: 0 }}>
      {rowLabel}
    </div>
    <div style={{ display: 'flex', gap: '4px' }}>
      {seats.map((seat) => {
        const state = selectedSeats.includes(seat.seat_code) ? 'selected' : seat.status;
        return (
          <div key={seat.seat_code}
            title={seat.seat_code}
            style={getSeatStyle(state)}
            onClick={() => onToggle(seat)}
          />
        );
      })}
    </div>
  </div>
);

export default SeatRow;
