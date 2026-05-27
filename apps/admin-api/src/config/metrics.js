const client = require('prom-client');
 
client.collectDefaultMetrics({ prefix: 'ticketops_admin_' });
 
const httpRequestsTotal = new client.Counter({
  name: 'ticketops_admin_http_requests_total',
  help: 'Total HTTP requests to admin-api',
  labelNames: ['method', 'route', 'status_code'],
});
 
const httpDuration = new client.Histogram({
  name: 'ticketops_admin_http_duration_seconds',
  help: 'HTTP request duration for admin-api',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2],
});
 
const eventsCreated = new client.Counter({
  name: 'ticketops_admin_events_created_total',
  help: 'Total events created via admin-api',
});
 
module.exports = { client, httpRequestsTotal, httpDuration, eventsCreated };
