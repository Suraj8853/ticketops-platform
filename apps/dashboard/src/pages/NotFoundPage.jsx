import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '120px', color: 'var(--accent)', lineHeight: 1 }}>404</div>
    <div style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '15px' }}>Page not found</div>
    <Link to="/" style={{ background: 'var(--accent)', color: '#000', padding: '10px 24px', borderRadius: '4px', fontWeight: 500 }}>
      Back to events
    </Link>
  </div>
);

export default NotFoundPage;
