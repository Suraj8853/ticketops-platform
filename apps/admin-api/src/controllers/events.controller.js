const pool = require('../config/db');
const logger = require('../utils/logger');
const { eventsCreated } = require('../config/metrics');
 
// GET /admin/events
const listEvents = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        e.*,
        COUNT(b.id) FILTER (WHERE b.status = 'confirmed') AS confirmed_bookings,
        COUNT(b.id) FILTER (WHERE b.status = 'pending')   AS pending_bookings,
        COUNT(b.id) FILTER (WHERE b.status = 'cancelled') AS cancelled_bookings,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'confirmed'), 0) AS revenue
      FROM events e
      LEFT JOIN bookings b ON b.event_id = e.id
      GROUP BY e.id
      ORDER BY e.event_date ASC
    `);
 
    logger.info({ message: 'admin events listed', request_id: req.requestId, count: rows.length });
    res.json({ events: rows });
  } catch (err) {
    next(err);
  }
};
 
// GET /admin/events/:id
const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Event not found' });
 
    logger.info({ message: 'admin event fetched', request_id: req.requestId, event_id: id });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
 
// POST /admin/events - create new event
const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, venue, event_date, price, total_seats } = req.body;
 
    if (!title || !category || !venue || !event_date || !total_seats) {
      return res.status(400).json({ error: 'title, category, venue, event_date, total_seats are required' });
    }
 
    // create event
    const { rows } = await pool.query(`
      INSERT INTO events (title, description, category, venue, event_date, price, total_seats, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'upcoming')
      RETURNING *
    `, [title, description, category, venue, event_date, price || 0, total_seats]);
 
    const event = rows[0];
 
    // auto-generate seats for the event
    const rows_labels = ['A','B','C','D','E','F','G','H','I','J'];
    const seatsPerRow = Math.ceil(total_seats / rows_labels.length);
    const seatInserts = [];
 
    for (let r = 0; r < rows_labels.length; r++) {
      for (let s = 1; s <= seatsPerRow; s++) {
        const seatCode = `${rows_labels[r]}${s}`;
        seatInserts.push(`(${event.id}, '${rows_labels[r]}', ${s}, '${seatCode}', 'available')`);
        if (seatInserts.length >= total_seats) break;
      }
      if (seatInserts.length >= total_seats) break;
    }
 
    await pool.query(`
      INSERT INTO seats (event_id, row_label, seat_no, seat_code, status)
      VALUES ${seatInserts.join(',')}
    `);
 
    eventsCreated.inc();
 
    logger.info({
      message: 'event created',
      request_id: req.requestId,
      event_id: event.id,
      title,
      total_seats,
    });
 
    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
};
 
// PUT /admin/events/:id - update event
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, venue, event_date, price, status } = req.body;
 
    const { rows } = await pool.query(`
      UPDATE events
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        venue = COALESCE($3, venue),
        event_date = COALESCE($4, event_date),
        price = COALESCE($5, price),
        status = COALESCE($6, status),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [title, description, venue, event_date, price, status, id]);
 
    if (!rows.length) return res.status(404).json({ error: 'Event not found' });
 
    logger.info({ message: 'event updated', request_id: req.requestId, event_id: id });
    res.json({ event: rows[0] });
  } catch (err) {
    next(err);
  }
};
 
// DELETE /admin/events/:id - cancel event
const cancelEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
 
    const { rows } = await pool.query(`
      UPDATE events SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [id]);
 
    if (!rows.length) return res.status(404).json({ error: 'Event not found' });
 
    logger.info({ message: 'event cancelled', request_id: req.requestId, event_id: id });
    res.json({ message: 'Event cancelled', event: rows[0] });
  } catch (err) {
    next(err);
  }
};
 
module.exports = { listEvents, getEvent, createEvent, updateEvent, cancelEvent };
