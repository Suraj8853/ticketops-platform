import React from 'react';
import useStore from '../../store/useStore';

const ROWS = ['A','B','C','D','E'];

const SeatMap = ({ seats, eventId }) => {
  const { selectedSeats, addSeat, removeSeat } = useStore();

  const getSeatState = (seat) => {
    if (selectedSeats.includes(seat.seat_code)) return 'selected';
    return seat.status;
  };

  const toggleSeat = (seat) => {
    if (seat.status === 'taken' || seat.status === 'held') return;
    if (selectedSeats.includes(seat.seat_code)) {
      removeSeat(seat.seat_code);
    } else if (selectedSeats.length < 6) {
      addSeat(seat.seat_code);
    }
  };

  const getSeatStyle = (state) => {
    const base = { width: '24px', height: '24px', borderRadius: '4px 4px 2px 2px', border: '1px solid', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' };
    if (state === 'selected') return { ...base, background: 'var(--accent)', borderColor: 'var(--accent)' };
    if (state === 'taken') return { ...base, background: 'var(--bg4)', borderColor: 'var(--border)', opacity: 0.4, cursor: 'not-allowed' };
    if (state === 'held') return { ...base, background: 'rgba(232,163,71,0.3)', borderColor: 'rgba(232,163,71,0.5)', cursor: 'not-allowed' };
    return { ...base, background: 'var(--bg3)', borderColor: 'var(--border2)' };
  };

  const grouped = ROWS.reduce((acc, row) => {
    acc[row] = seats.filter((s) => s.row_label === row);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {[['var(--bg3)', 'var(--border2)', 'Available'],
          ['var(--accent)', 'var(--accent)', 'Selected'],
          ['rgba(232,163,71,0.3)', 'rgba(232,163,71,0.5)', 'Held (Redis TTL)'],
          ['rgba(255,255,255,0.1)', 'transparent', 'Taken']
        ].map(([bg, border, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: bg, border: `1px solid ${border}` }} />
            {label}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)', padding: '8px', border: '1px solid var(--border)', marginBottom: '1.5rem', background: 'var(--bg3)' }}>
        — STAGE —
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {ROWS.map((row) => (
          <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted)', width: '16px', textAlign: 'center', flexShrink: 0 }}>{row}</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
              {(grouped[row] || []).map((seat) => {
                const state = getSeatState(seat);
                return (
                  <div key={seat.seat_code} title={seat.seat_code}
                    style={getSeatStyle(state)}
                    onClick={() => toggleSeat(seat)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatMap;
