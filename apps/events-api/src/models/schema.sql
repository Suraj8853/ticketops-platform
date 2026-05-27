-- TicketOps Database Schema
 
CREATE TABLE IF NOT EXISTS events (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  category    VARCHAR(50) NOT NULL,
  venue       VARCHAR(255) NOT NULL,
  event_date  TIMESTAMP NOT NULL,
  price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_seats INTEGER NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS seats (
  id         SERIAL PRIMARY KEY,
  event_id   INTEGER REFERENCES events(id) ON DELETE CASCADE,
  row_label  VARCHAR(5) NOT NULL,
  seat_no    INTEGER NOT NULL,
  seat_code  VARCHAR(10) NOT NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'available',
  UNIQUE(event_id, seat_code)
);
 
CREATE TABLE IF NOT EXISTS bookings (
  id          SERIAL PRIMARY KEY,
  booking_ref VARCHAR(20) UNIQUE NOT NULL,
  event_id    INTEGER REFERENCES events(id),
  customer_name  VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  seats       TEXT[] NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  qr_url      TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
 
-- seed some events for local dev
INSERT INTO events (title, description, category, venue, event_date, price, total_seats, status)
VALUES
  ('Arctic Monkeys Live', 'World tour 2025', 'concert', 'JLN Stadium, Delhi', '2025-06-14 19:00:00', 2499, 600, 'live'),
  ('IPL Final 2025', 'The big one', 'sports', 'Wankhede Stadium, Mumbai', '2025-06-22 19:30:00', 1200, 400, 'live'),
  ('Coldplay Music of the Spheres', 'World tour', 'concert', 'DY Patil Stadium, Mumbai', '2025-08-09 18:00:00', 4999, 1200, 'live'),
  ('AWS Summit India', 'Cloud conference', 'conference', 'Hyderabad International Convention', '2025-07-17 09:00:00', 0, 2000, 'upcoming'),
  ('Zakir Khan Live', 'Stand up comedy', 'comedy', 'Chowdiah Hall, Bangalore', '2025-08-01 20:00:00', 999, 300, 'live'),
  ('KubeConf APAC', 'Kubernetes conference', 'conference', 'JNCC, Bangalore', '2025-09-26 09:00:00', 1500, 600, 'upcoming')
ON CONFLICT DO NOTHING;
