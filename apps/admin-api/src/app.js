require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const requestId = require('./middleware/requestId');
const metricsMiddleware = require('./middleware/metrics');
const errorHandler = require('./middleware/errorHandler');
const jwtAuth = require('./middleware/jwtAuth');
const eventsRoutes = require('./routes/events.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const authRoutes = require('./routes/auth.routes');
const { client } = require('./config/metrics');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestId);
app.use(metricsMiddleware);
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 10000 }));

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

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use('/auth', authRoutes);
app.use('/admin/events', jwtAuth, eventsRoutes);
app.use('/admin/bookings', jwtAuth, bookingsRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ message: `admin-api running on port ${PORT}`, service: 'admin-api' });
});

module.exports = app;
