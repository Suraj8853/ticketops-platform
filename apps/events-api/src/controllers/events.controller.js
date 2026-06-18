const pool = require('../config/db');
const redis = require('../config/redis');
const logger = require('../utils/logger');

// GET /api/events
const listEvents = async (req, res, next) => {
  try {
    const { category } = req.query;
    const cacheKey = category ? `events:category:${category}` : 'events:all';

    // check Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info({ message: 'events cache hit', request_id: req.requestId, cacheKey });
      return res.json(JSON.parse(cached));
    }

    let query = `
      SELECT e.*,
        COUNT(s.id) FILTER (WHERE s.status = 'available') AS available_seats
      FROM events e
      LEFT JOIN seats s ON s.event_id = e.id
    `;
    const params = [];
    if (category) {
      query += ` WHERE e.category = $1`;
      params.push(category);
    }
    query += ` GROUP BY e.id ORDER BY e.event_date ASC`;

    const { rows } = await pool.query(query, params);

    // cache for 30 seconds
    await redis.setex(cacheKey, 30, JSON.stringify({ events: rows }));

    logger.info({ message: 'events listed', request_id: req.requestId, count: rows.length });
    res.json({ events: rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/events/:id
const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // check Redis cache first
    const cached = await redis.get(`event:${id}`);
    if (cached) {
      logger.info({ message: 'event cache hit', request_id: req.requestId, event_id: id });
      return res.json(JSON.parse(cached));
    }

    const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Event not found' });

    // cache for 60 seconds
    await redis.setex(`event:${id}`, 60, JSON.stringify(rows[0]));

    logger.info({ message: 'event fetched', request_id: req.requestId, event_id: id });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET /api/events/:id/seats
const getSeats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM seats WHERE event_id = $1 ORDER BY row_label, seat_no',
      [id]
    );

    // check Redis for any held seats
    const heldKeys = await redis.keys(`seat:held:${id}:*`);
    const heldSeats = heldKeys.map((k) => k.split(':')[3]);
    const seats = rows.map((seat) => ({
      ...seat,
      status: heldSeats.includes(seat.seat_code) ? 'held' : seat.status,
    }));

    logger.info({ message: 'seats fetched', request_id: req.requestId, event_id: id });
    res.json({ seats });
  } catch (err) {
    next(err);
  }
};

module.exports = { listEvents, getEvent, getSeats };
