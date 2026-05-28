const pool = require('../config/db');
const redis = require('../config/redis');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { bookingsTotal, bookingDuration, seatsHeld } = require('../config/metrics');

const SEAT_LOCK_TTL = parseInt(process.env.SEAT_LOCK_TTL) || 600;

// POST /api/bookings
const createBooking = async (req, res, next) => {
  const end = bookingDuration.startTimer();
  try {
    const { event_id, customer_name, customer_email, seats } = req.body;

    if (!event_id || !customer_name || !customer_email || !seats?.length) {
      return res.status(400).json({ error: 'event_id, customer_name, customer_email, seats are required' });
    }

    // check event exists
    const { rows: eventRows } = await pool.query('SELECT * FROM events WHERE id = $1', [event_id]);
    if (!eventRows.length) return res.status(404).json({ error: 'Event not found' });
    const event = eventRows[0];

    // check seats are available in DB
    const { rows: seatRows } = await pool.query(
      `SELECT * FROM seats WHERE event_id = $1 AND seat_code = ANY($2)`,
      [event_id, seats]
    );
    if (seatRows.length !== seats.length) {
      return res.status(400).json({ error: 'One or more seats not found' });
    }
    const unavailable = seatRows.filter((s) => s.status !== 'available');
    if (unavailable.length) {
      return res.status(409).json({ error: 'One or more seats already taken', seats: unavailable.map((s) => s.seat_code) });
    }

    // check Redis for held seats — atomic SETNX per seat
    for (const seat of seats) {
      const key = `seat:held:${event_id}:${seat}`;
      const set = await redis.setnx(key, 'held');
      if (!set) {
        return res.status(409).json({ error: `Seat ${seat} is currently held by another user` });
      }
      await redis.expire(key, SEAT_LOCK_TTL);
    }

    // update seats held gauge
    const heldKeys = await redis.keys(`seat:held:${event_id}:*`);
    seatsHeld.set(heldKeys.length);

    // calculate total
    const total = event.price * seats.length * 1.05; // 5% convenience fee
    const bookingRef = 'TKT-' + Math.floor(100000 + Math.random() * 900000);

    // write booking to DB
    const { rows: bookingRows } = await pool.query(
      `INSERT INTO bookings (booking_ref, event_id, customer_name, customer_email, seats, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [bookingRef, event_id, customer_name, customer_email, seats, total]
    );
    const booking = bookingRows[0];

    // push job to Redis queue for bookings-worker
    await redis.lpush('bookings:queue', JSON.stringify({
      booking_id: booking.id,
      booking_ref: bookingRef,
      event_id,
      customer_name,
      customer_email,
      seats,
      event_title: event.title,
    }));

    bookingsTotal.inc({ status: 'pending' });
    end();

    logger.info({
      message: 'booking created',
      request_id: req.requestId,
      booking_ref: bookingRef,
      event_id,
      seats,
    });

    res.status(201).json({ booking });
  } catch (err) {
    end();
    next(err);
  }
};

// GET /api/bookings/:id
const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM bookings WHERE booking_ref = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });

    logger.info({ message: 'booking fetched', request_id: req.requestId, booking_ref: id });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM bookings WHERE booking_ref = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });

    const booking = rows[0];
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    // update booking status
    await pool.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE booking_ref = $1`,
      [id]
    );

    // release seats in DB
    await pool.query(
      `UPDATE seats SET status = 'available' WHERE event_id = $1 AND seat_code = ANY($2)`,
      [booking.event_id, booking.seats]
    );

    // release seats in Redis
    for (const seat of booking.seats) {
      await redis.del(`seat:held:${booking.event_id}:${seat}`);
    }

    bookingsTotal.inc({ status: 'cancelled' });

    logger.info({
      message: 'booking cancelled',
      request_id: req.requestId,
      booking_ref: id,
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getBooking, cancelBooking };
