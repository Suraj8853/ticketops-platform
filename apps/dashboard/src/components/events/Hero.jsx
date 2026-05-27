import React from 'react';

const Hero = () => (
  <div style={{
    padding: '5rem 2rem 3rem', borderBottom: '1px solid var(--border)',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', right: '-2rem', top: '50%', transform: 'translateY(-50%)',
      fontFamily: 'var(--font-display)', fontSize: '220px',
      color: 'rgba(232,197,71,0.04)', pointerEvents: 'none', userSelect: 'none',
    }}>LIVE</div>

    <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '1rem' }}>
      TicketOps Platform · Production Demo
    </div>

    <div style={{ fontFamily: 'var(--font-display)', fontSize: '72px', lineHeight: 0.95, letterSpacing: '2px', marginBottom: '1.5rem' }}>
      FIND YOUR<br />
      <em style={{ fontStyle: 'italic', color: 'var(--muted)', fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '52px' }}>
        next experience
      </em><br />
      LIVE.
    </div>

    <div style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '480px', lineHeight: 1.6, marginBottom: '2rem' }}>
      Browse upcoming concerts, sports events, and conferences.
      Powered by EKS, ArgoCD, and a Redis-cached seat inventory engine.
    </div>

    <div style={{ display: 'flex', gap: '3rem' }}>
      {[['2,847', 'Tickets sold'], ['12', 'Live events'], ['99.9%', 'Uptime SLO']].map(([num, label]) => (
        <div key={label}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--accent)' }}>{num}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</div>
        </div>
      ))}
    </div>
  </div>
);

export default Hero;
