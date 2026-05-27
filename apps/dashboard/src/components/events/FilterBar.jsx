import React from 'react';

const FILTERS = ['All', 'Concert', 'Sports', 'Conference', 'Comedy'];

const FilterBar = ({ active, onChange }) => (
  <div style={{
    padding: '1rem 2rem', display: 'flex', gap: '0.75rem',
    borderBottom: '1px solid var(--border)',
  }}>
    {FILTERS.map((f) => {
      const isActive = active === f.toLowerCase() || (f === 'All' && active === 'all');
      return (
        <button key={f} onClick={() => onChange(f === 'All' ? 'all' : f.toLowerCase())}
          style={{
            padding: '6px 16px', borderRadius: '20px', fontSize: '12px',
            border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border2)'}`,
            background: isActive ? 'var(--accent)' : 'transparent',
            color: isActive ? '#000' : 'var(--muted)',
            fontWeight: isActive ? 500 : 400,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
          {f}
        </button>
      );
    })}
  </div>
);

export default FilterBar;
