import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>
    {text}
  </div>
);

export default LoadingSpinner;
