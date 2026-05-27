require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');
const eventsRoutes = require('./routes/events.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const { client } = require('./config/metrics');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 4000;

// ── security ──
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestId);
app.use(morgan('combined'));

// ── stricter rate limit for admin ──
app.use(rateLimit({ windowMs: 60 * 1000, max: 50 }));

// ── health probes ──
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'admin-api' }));
app.get('/ready', async (req, res) => {
  try {
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});

// ── metrics ──
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.contentType);
  res.end(await client.metrics());
});

// ── admin routes — all protected by API key auth ──
app.use('/admin/events', auth, eventsRoutes);
app.use('/admin/bookings', auth, bookingsRoutes);

// ── 404 ──
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── error handler ──
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ message: `admin-api running on port ${PORT}`, service: 'admin-api' });
});

module.exports = app;
