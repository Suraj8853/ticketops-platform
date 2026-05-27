import React from 'react';

const colors = {
  live:      { bg: 'rgba(76,175,128,0.15)',  color: 'var(--success)' },
  upcoming:  { bg: 'rgba(232,197,71,0.15)',  color: 'var(--accent)'  },
  sold:      { bg: 'rgba(224,85,85,0.15)',   color: 'var(--danger)'  },
  confirmed: { bg: 'rgba(76,175,128,0.15)',  color: 'var(--success)' },
  pending:   { bg: 'rgba(232,197,71,0.15)',  color: 'var(--accent)'  },
  cancelled: { bg: 'rgba(224,85,85,0.15)',   color: 'var(--danger)'  },
  expired:   { bg: 'rgba(136,136,128,0.15)', color: 'var(--muted)'   },
};

const StatusBadge = ({ status }) => {
  const style = colors[status] || colors.upcoming;
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '10px', letterSpacing: '1px',
      textTransform: 'uppercase', fontWeight: 500,
      padding: '3px 8px', borderRadius: '3px',
      background: style.bg, color: style.color,
    }}>
      {status}
    </span>
  );
};

export default StatusBadge;
