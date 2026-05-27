const pool = require('../config/db');
const redis = require('../config/redis');
const { generateQR, uploadQR } = require('../services/qr.service');
const { sendConfirmationEmail } = require('../services/email.service');
const { jobsProcessed, qrGenerationDuration, emailsSent } = require('../config/metrics');
const logger = require('../utils/logger');

const processBooking = async (job) => {
  const { booking_id, booking_ref, event_id, customer_name, customer_email, seats, event_title } = job;

  logger.info({
    message: 'processing booking job',
    booking_ref,
    booking_id,
    event_id,
  });

  try {
    // 1. generate QR code
    const end = qrGenerationDuration.startTimer();
    const qrBuffer = await generateQR({ booking_ref, event_title, seats });

    // 2. upload QR to S3 — get pre-signed URL back
    const qrUrl = await uploadQR(booking_ref, qrBuffer);
    end();

    // 3. send confirmation email via SES
    try {
      await sendConfirmationEmail({ customer_email, customer_name, booking_ref, event_title, seats, qr_url: qrUrl });
      emailsSent.inc({ status: 'sent' });
    } catch (emailErr) {
      // email failure should not fail the whole booking
      emailsSent.inc({ status: 'failed' });
      logger.warn({ message: 'email failed but continuing', booking_ref, error: emailErr.message });
    }

    // 4. update booking status → confirmed + store QR URL
    await pool.query(
      `UPDATE bookings SET status = 'confirmed', qr_url = $1, updated_at = NOW() WHERE booking_ref = $2`,
      [qrUrl, booking_ref]
    );

    // 5. update seats status → taken in DB
    await pool.query(
      `UPDATE seats SET status = 'taken' WHERE event_id = $1 AND seat_code = ANY($2)`,
      [event_id, seats]
    );

    // 6. release Redis seat locks — booking confirmed, DB is source of truth now
    for (const seat of seats) {
      await redis.del(`seat:held:${event_id}:${seat}`);
    }

    jobsProcessed.inc({ status: 'success' });

    logger.info({
      message: 'booking confirmed successfully',
      booking_ref,
      booking_id,
      qr_url: qrUrl,
    });

  } catch (err) {
    jobsProcessed.inc({ status: 'failed' });

    logger.error({
      message: 'booking job failed',
      booking_ref,
      booking_id,
      error: err.message,
      stack: err.stack,
    });

    // mark booking as failed in DB so CronJob can retry or expire it
    await pool.query(
      `UPDATE bookings SET status = 'failed', updated_at = NOW() WHERE booking_ref = $1`,
      [booking_ref]
    ).catch(() => {}); // don't throw if DB update fails too

    throw err; // re-throw so worker knows this job failed
  }
};

module.exports = { processBooking };
