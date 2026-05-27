const client = require('prom-client');

client.collectDefaultMetrics({ prefix: 'ticketops_worker_' });

// jobs processed counter
const jobsProcessed = new client.Counter({
  name: 'ticketops_worker_jobs_processed_total',
  help: 'Total jobs processed by bookings-worker',
  labelNames: ['status'], // success, failed
});

// QR generation duration
const qrGenerationDuration = new client.Histogram({
  name: 'ticketops_qr_generation_duration_seconds',
  help: 'Time taken to generate and upload QR code to S3',
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

// current queue depth
const queueDepth = new client.Gauge({
  name: 'ticketops_worker_queue_depth',
  help: 'Current number of jobs in Redis queue',
});

// email send counter
const emailsSent = new client.Counter({
  name: 'ticketops_worker_emails_sent_total',
  help: 'Total confirmation emails sent via SES',
  labelNames: ['status'], // sent, failed
});

module.exports = {
  client,
  jobsProcessed,
  qrGenerationDuration,
  queueDepth,
  emailsSent,
};
