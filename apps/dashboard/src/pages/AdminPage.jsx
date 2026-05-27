import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import Dashboard from '../components/admin/Dashboard';
import EventsTable from '../components/admin/EventsTable';
import BookingsTable from '../components/admin/BookingsTable';
import WorkerQueue from '../components/admin/WorkerQueue';
import InfraHealth from '../components/admin/InfraHealth';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useAdmin } from '../hooks/useAdmin';

const TITLES = {
  Dashboard:      'DASHBOARD',
  Events:         'EVENTS',
  Bookings:       'BOOKINGS',
  Reports:        'REPORTS',
  Infrastructure: 'INFRASTRUCTURE',
};

const AdminPage = () => {
  const [view, setView] = useState('Dashboard');
  const { events, bookings, reports, loading } = useAdmin();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 56px)' }}>
      <AdminSidebar active={view} onChange={setView} />

      <div style={{ padding: '2rem', overflowY: 'auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '1px' }}>
            {TITLES[view]}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
            TicketOps Admin · EKS cluster: ap-south-1
          </div>
        </div>

        {loading ? <LoadingSpinner text="Loading admin data..." /> : (
          <>
            {view === 'Dashboard'      && <Dashboard events={events} bookings={bookings} reports={reports} />}
            {view === 'Events'         && <EventsTable events={events} />}
            {view === 'Bookings'       && <BookingsTable bookings={bookings} />}
            {view === 'Infrastructure' && <InfraHealth />}
            {view === 'Reports'        && (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Event','Total Seats','Confirmed','Revenue','Occupancy'].map((h) => (
                      <th key={h} style={{ padding: '10px 1.25rem', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id}>
                        <td style={{ padding: '12px 1.25rem', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{r.title}</td>
                        <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{r.total_seats}</td>
                        <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{r.confirmed_bookings}</td>
                        <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)', color: 'var(--accent)' }}>₹{Number(r.revenue).toLocaleString()}</td>
                        <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' }}>{r.occupancy_percent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
