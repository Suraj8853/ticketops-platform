require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
 
const requestId = require('./middleware/requestId');
const metricsMiddleware = require('./middleware/metrics');
const errorHandler = require('./middleware/errorHandler');
const eventsRoutes = require('./routes/events.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const { client } = require('./config/metrics');
const logger = require('./utils/logger');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
// ── security middleware ──
app.use(helmet());
app.use(cors());
 
// ── request parsing ──
app.use(express.json());
 
// ── request ID (Loki tracing) ──
app.use(requestId);
app.use(metricsMiddleware);
 
// ── HTTP logging ──
app.use(morgan('combined'));
 
// ── rate limiting ──
app.use(rateLimit({ windowMs: 60 * 1000, max: 10000 }));
 
// ── health probes (used by Kubernetes liveness + readiness) ──
app.get('/health', (req, res) => {
  console.log('Health check called - v1.9.1');
  res.json({ status: 'ok', service: 'events-api' });
});
app.get('/ready', async (req, res) => {
  try {
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
 
// ── Prometheus metrics endpoint ──
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
 
// ── API routes ──
app.use('/api/events', eventsRoutes);
app.use('/api/bookings', bookingsRoutes);
 
// ── 404 handler ──
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
 
// ── error handler ──
app.use(errorHandler);
 
app.listen(PORT, () => {
  logger.info({ message: `events-api running on port ${PORT}`, service: 'events-api' });
});
 
module.exports = app;
