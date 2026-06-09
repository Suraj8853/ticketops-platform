import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const bookingErrors = new Counter('booking_errors');
const bookingSuccess = new Counter('booking_success');
const bookingDuration = new Trend('booking_duration');
const errorRate = new Rate('error_rate');

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
    error_rate: ['rate<0.05'],
  },
};

const BASE_URL = 'http://k8s-ticketop-ticketop-beac6174a2-1892759112.ap-south-1.elb.amazonaws.com';

function randomSeat() {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const row = rows[Math.floor(Math.random() * rows.length)];
  const num = Math.floor(Math.random() * 20) + 1;
  return `${row}${num}`;
}

function randomEventId() {
  const ids = [1, 2, 3, 4, 5, 6];
  return ids[Math.floor(Math.random() * ids.length)];
}

export default function () {
  const eventId = randomEventId();

  const eventsRes = http.get(`${BASE_URL}/api/events`, {
    tags: { name: 'get_events' },
  });

  check(eventsRes, {
    'get events status 200': (r) => r.status === 200,
  });

  errorRate.add(eventsRes.status !== 200);
  sleep(0.5);

  const payload = JSON.stringify({
    event_id: eventId,
    customer_name: `User ${__VU}`,
    customer_email: `user${__VU}@test.com`,
    seats: [randomSeat()],
  });

  const bookingStart = Date.now();
  const bookingRes = http.post(
    `${BASE_URL}/api/bookings`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'create_booking' },
    }
  );
  bookingDuration.add(Date.now() - bookingStart);

  check(bookingRes, {
    'booking status 201 or 409': (r) => r.status === 201 || r.status === 409,
  });

  if (bookingRes.status === 201) {
    bookingSuccess.add(1);
    errorRate.add(0);
    const bookingRef = bookingRes.json('booking.booking_ref');
    if (bookingRef) {
      const checkRes = http.get(`${BASE_URL}/api/bookings/${bookingRef}`, {
        tags: { name: 'get_booking' },
      });
      check(checkRes, {
        'get booking status 200': (r) => r.status === 200,
      });
    }
  } else if (bookingRes.status === 409) {
    errorRate.add(0);
  } else {
    bookingErrors.add(1);
    errorRate.add(1);
  }

  sleep(1);
}
