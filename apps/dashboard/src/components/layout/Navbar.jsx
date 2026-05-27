import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 2rem', height: '56px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  logo: {
    fontFamily: 'var(--font-display)', fontSize: '22px',
    letterSpacing: '2px', color: 'var(--accent)',
  },
  logoSpan: { color: 'var(--text)' },
  links: { display: 'flex', gap: '2rem' },
  link: { color: 'var(--muted)', fontSize: '13px', transition: 'color 0.2s' },
  activeLink: { color: 'var(--text)' },
  badge: {
    background: 'var(--accent)', color: '#000',
    fontSize: '11px', fontWeight: 500,
    padding: '4px 12px', borderRadius: '20px',
  },
};

const Navbar = () => {
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        TICKET<span style={styles.logoSpan}>OPS</span>
      </Link>
      <div style={styles.links}>
        <Link to="/" style={location.pathname === '/' ? styles.activeLink : styles.link}>
          Events
        </Link>
        <Link to="/admin" style={location.pathname === '/admin' ? styles.activeLink : styles.link}>
          Admin
        </Link>
      </div>
      <Link to="/" style={styles.badge}>Browse Events</Link>
    </nav>
  );
};

export default Navbar;
