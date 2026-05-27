import React from 'react';

const ITEMS = [
  { label: 'Overview', items: ['Dashboard', 'Events', 'Bookings'] },
  { label: 'Operations', items: ['Reports', 'Infrastructure'] },
];

const AdminSidebar = ({ active, onChange }) => (
  <div style={{
    borderRight: '1px solid var(--border)',
    padding: '1.5rem 0',
    background: 'var(--bg2)',
    minHeight: 'calc(100vh - 56px)',
  }}>
    {ITEMS.map(({ label, items }) => (
      <div key={label} style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', padding: '0 0.5rem', marginBottom: '0.75rem' }}>
          {label}
        </div>
        {items.map((item) => (
          <div key={item} onClick={() => onChange(item)}
            style={{
              padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '13px', marginBottom: '2px',
              background: active === item ? 'rgba(232,197,71,0.1)' : 'transparent',
              color: active === item ? 'var(--accent)' : 'var(--muted)',
              transition: 'all 0.15s',
            }}>
            {item}
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default AdminSidebar;
