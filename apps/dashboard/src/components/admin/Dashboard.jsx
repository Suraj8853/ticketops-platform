import React from 'react';
import MetricCard from './MetricCard';
import BookingsTable from './BookingsTable';

const Dashboard = ({ events, bookings, reports }) => {
  const totalRevenue = reports.reduce((acc, r) => acc + Number(r.revenue), 0);
  const liveEvents = events.filter((e) => e.status === 'live').length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard label="Total Bookings" value={bookings.length} color="var(--accent)" delta="↑ 12% this week" />
        <MetricCard label="Revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`} color="var(--success)" delta="↑ 8% this week" />
        <MetricCard label="Live Events" value={liveEvents} delta="Across all venues" />
        <MetricCard label="Error Rate" value="0.03%" color="var(--success)" delta="Within 99.9% SLO" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard label="events-api pods" value="3 / 10" delta="HPA · CPU 34%" />
        <MetricCard label="PgBouncer pool"  value="18 / 200" delta="Transaction mode" />
        <MetricCard label="Worker queue"    value="4 jobs" delta="Processing normally" />
      </div>
      <BookingsTable bookings={bookings.slice(0, 6)} />
    </div>
  );
};

export default Dashboard;
