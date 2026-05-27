import React from 'react';

const MetricCard = ({ label, value, color = 'var(--text)', delta, deltaType = 'positive' }) => (
  <div style={{
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '1.25rem',
  }}>
    <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
      {label}
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color }}>
      {value}
    </div>
    {delta && (
      <div style={{ fontSize: '11px', color: deltaType === 'positive' ? 'var(--success)' : 'var(--danger)', marginTop: '4px' }}>
        {delta}
      </div>
    )}
  </div>
);

export default MetricCard;
