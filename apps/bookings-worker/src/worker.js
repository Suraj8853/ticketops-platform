require('dotenv').config();
const http = require('http');
const redis = require('./config/redis');
const { processBooking } = require('./jobs/processBooking');
const { client, queueDepth } = require('./config/metrics');
const logger = require('./utils/logger');
 
const QUEUE = process.env.QUEUE_NAME || 'bookings:queue';
const METRICS_PORT = process.env.METRICS_PORT || 9090;
 
// ── health check HTTP server ──
// Kubernetes liveness probe hits GET /health
// worker has no Express — just a tiny http server for probes
const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'bookings-worker' }));
  } else if (req.url === '/metrics') {
    res.writeHead(200, { 'Content-Type': client.contentType });
    res.end(await client.metrics());
  } else {
    res.writeHead(404);
    res.end();
  }
});
 
server.listen(METRICS_PORT, () => {
  logger.info({ message: `bookings-worker metrics on port ${METRICS_PORT}` });
});
 
// ── main worker loop ──
const run = async () => {
  logger.info({ message: 'bookings-worker started', queue: QUEUE });
 
  while (true) {
    try {
      // update queue depth gauge every iteration
      const depth = await redis.llen(QUEUE);
      queueDepth.set(depth);
 
      // BRPOP blocks until a job arrives — no polling, no wasted CPU
      // timeout 5 seconds — then loops back and checks again
      const result = await redis.brpop(QUEUE, 5);
 
      if (!result) continue; // timeout — no job, loop again
 
      const [, raw] = result;
      const job = JSON.parse(raw);
 
      logger.info({ message: 'job received', booking_ref: job.booking_ref });
 
      await processBooking(job);
 
    } catch (err) {
      logger.error({ message: 'worker loop error', error: err.message });
      // wait 1 second before retrying to avoid tight error loop
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
};
 
// ── graceful shutdown ──
const shutdown = async (signal) => {
  logger.info({ message: `received ${signal}, shutting down gracefully` });
  server.close();
  process.exit(0);
};
 
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
 
// start
run().catch((err) => {
  logger.error({ message: 'fatal worker error', error: err.message });
  process.exit(1);
});
