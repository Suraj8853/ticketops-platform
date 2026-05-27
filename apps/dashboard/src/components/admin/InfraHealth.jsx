import React from 'react';
import MetricCard from './MetricCard';
import StatusBadge from '../shared/StatusBadge';

const SERVICES = [
  { name: 'events-api',       namespace: 'ticketops-prod', replicas: '3 / 10', cpu: '34%', memory: '210Mi', hpa: 'live' },
  { name: 'bookings-worker',  namespace: 'ticketops-prod', replicas: '2 / 8',  cpu: '18%', memory: '140Mi', hpa: 'live' },
  { name: 'admin-api',        namespace: 'ticketops-prod', replicas: '2 / 2',  cpu: '8%',  memory: '95Mi',  hpa: 'upcoming' },
  { name: 'dashboard',        namespace: 'ticketops-prod', replicas: '2 / 2',  cpu: '2%',  memory: '32Mi',  hpa: 'upcoming' },
  { name: 'pgbouncer',        namespace: 'ticketops-prod', replicas: '2 / 2',  cpu: '1%',  memory: '18Mi',  hpa: 'upcoming' },
];

const InfraHealth = () => (
  <div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
      <MetricCard label="events-api pods"    value="3 / 10" delta="HPA · CPU 34%" />
      <MetricCard label="PgBouncer pool"     value="18 / 200" delta="Transaction mode" />
      <MetricCard label="Error rate (SLO)"   value="0.03%" color="var(--success)" delta="Within 99.9% SLO" />
      <MetricCard label="Worker queue"       value="4 jobs" delta="Normal" />
    </div>
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>
        EKS Service Health · cluster: cloudops-dev · ap-south-1
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Service', 'Namespace', 'Replicas', 'CPU', 'Memory', 'HPA'].map((h) => (
              <th key={h} style={{ padding: '10px 1.25rem', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SERVICES.map((s) => (
            <tr key={s.name}>
              <td style={{ padding: '12px 1.25rem', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{s.name}</td>
              <td style={{ padding: '12px 1.25rem', fontFamily: 'monospace', fontSize: '12px', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{s.namespace}</td>
              <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{s.replicas}</td>
              <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{s.cpu}</td>
              <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{s.memory}</td>
              <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}><StatusBadge status={s.hpa} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default InfraHealth;
