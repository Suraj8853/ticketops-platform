const client = require('prom-client');
 
// collect default metrics (CPU, memory, event loop)
client.collectDefaultMetrics({ prefix: 'ticketops_' });
 
// total bookings counter
const bookingsTotal = new client.Counter({
  name: 'ticketops_bookings_total',
  help: 'Total number of bookings',
  labelNames: ['status'],
});
 
// booking duration histogram
const bookingDuration = new client.Histogram({
  name: 'ticketops_booking_duration_seconds',
  help: 'Time from POST /bookings to response',
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
 
// seats currently held in Redis
const seatsHeld = new client.Gauge({
  name: 'ticketops_seats_held_current',
  help: 'Current number of seats in HELD state in Redis',
});
 
// HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: 'ticketops_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
 
// HTTP request duration
const httpDuration = new client.Histogram({
  name: 'ticketops_http_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2],
});
 
module.exports = {
  client,
  bookingsTotal,
  bookingDuration,
  seatsHeld,
  httpRequestsTotal,
  httpDuration,
};
