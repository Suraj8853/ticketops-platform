import React from 'react';
import MetricCard from './MetricCard';
import StatusBadge from '../shared/StatusBadge';

// Static demo data — in production this would come from admin-api worker stats endpoint
const JOBS = [
  { id: 'job-9921', type: 'QR generation', booking: 'TKT-847201', status: 'confirmed', retry: 0 },
  { id: 'job-9920', type: 'SES email',     booking: 'TKT-847198', status: 'pending',   retry: 0 },
  { id: 'job-9919', type: 'S3 upload',     booking: 'TKT-847185', status: 'cancelled', retry: 2 },
  { id: 'job-9918', type: 'QR generation', booking: 'TKT-847179', status: 'pending',   retry: 0 },
];

const WorkerQueue = () => (
  <div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
      <MetricCard label="Queue Depth"     value="4"   color="var(--danger)"  delta="↑ 3 pending QR jobs" deltaType="negative" />
      <MetricCard label="Processed Today" value="284" color="var(--success)" delta="↑ 12% vs yesterday" />
      <MetricCard label="Avg QR Gen Time" value="1.2s" delta="Within SLO" />
    </div>
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>Active Jobs</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Job ID', 'Type', 'Booking', 'Status', 'Retries'].map((h) => (
              <th key={h} style={{ padding: '10px 1.25rem', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {JOBS.map((j) => (
            <tr key={j.id}>
              <td style={{ padding: '12px 1.25rem', fontFamily: 'monospace', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>{j.id}</td>
              <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{j.type}</td>
              <td style={{ padding: '12px 1.25rem', fontFamily: 'monospace', fontSize: '12px', borderBottom: '1px solid var(--border)' }}>{j.booking}</td>
              <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}><StatusBadge status={j.status} /></td>
              <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)', color: j.retry > 0 ? 'var(--danger)' : 'var(--muted)' }}>{j.retry}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default WorkerQueue;
