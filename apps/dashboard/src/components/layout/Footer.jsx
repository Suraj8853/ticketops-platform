import React from 'react';

const Footer = () => (
  <footer style={{
    borderTop: '1px solid var(--border)',
    padding: '1.5rem 2rem',
    display: 'flex', justifyContent: 'space-between',
    fontSize: '12px', color: 'var(--muted)',
  }}>
    <div>TicketOps Platform · Portfolio Project 2</div>
    <div>EKS · ArgoCD · Prometheus · Loki · Kyverno</div>
  </footer>
);

export default Footer;
