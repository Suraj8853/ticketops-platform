const pool = require('../config/db');
const logger = require('../utils/logger');

// GET /admin/bookings - all bookings with filters
const listBookings = async (req, res, next) => {
  try {
    const { event_id, status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT b.*, e.title as event_title, e.venue
      FROM bookings b
      JOIN events e ON e.id = b.event_id
      WHERE 1=1
    `;
    const params = [];

    if (event_id) {
      params.push(event_id);
      query += ` AND b.event_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY b.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const { rows } = await pool.query(query, params);

    logger.info({ message: 'admin bookings listed', request_id: req.requestId, count: rows.length });
    res.json({ bookings: rows });
  } catch (err) {
    next(err);
  }
};

// GET /admin/reports - revenue and occupancy summary
const getReports = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        e.id,
        e.title,
        e.total_seats,
        COUNT(b.id) FILTER (WHERE b.status = 'confirmed') AS confirmed_bookings,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'confirmed'), 0) AS revenue,
        ROUND(
          COUNT(b.id) FILTER (WHERE b.status = 'confirmed') * 100.0 / NULLIF(e.total_seats, 0),
          2
        ) AS occupancy_percent
      FROM events e
      LEFT JOIN bookings b ON b.event_id = e.id
      GROUP BY e.id
      ORDER BY revenue DESC
    `);

    logger.info({ message: 'admin report generated', request_id: req.requestId });
    res.json({ report: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { listBookings, getReports };
