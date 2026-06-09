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
  id           SERIAL PRIMARY KEY,
  event_id     INTEGER REFERENCES events(id) ON DELETE CASCADE,
  row_label    VARCHAR(5) NOT NULL,
  seat_no      INTEGER NOT NULL,
  seat_code    VARCHAR(10) NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'available',
  locked_until TIMESTAMP,
  UNIQUE(event_id, seat_code)
);

CREATE TABLE IF NOT EXISTS bookings (
  id             SERIAL PRIMARY KEY,
  booking_ref    VARCHAR(20) UNIQUE NOT NULL,
  event_id       INTEGER REFERENCES events(id),
  customer_name  VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  seats          TEXT[] NOT NULL,
  total_amount   NUMERIC(10, 2) NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending',
  qr_url         TEXT,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);

-- Add locked_until column if not exists (for existing databases)
ALTER TABLE seats ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;


-- Seed data
INSERT INTO events (title, description, category, venue, event_date, price, total_seats, status)
SELECT * FROM (VALUES
  ('Arctic Monkeys Live', 'World tour 2025', 'concert', 'JLN Stadium, Delhi', '2025-06-14 19:00:00'::timestamp, 2499::numeric, 600, 'live'),
  ('IPL Final 2025', 'The big one', 'sports', 'Wankhede Stadium, Mumbai', '2025-06-22 19:30:00'::timestamp, 1200::numeric, 400, 'live'),
  ('Coldplay Music of the Spheres', 'World tour', 'concert', 'DY Patil Stadium, Mumbai', '2025-08-09 18:00:00'::timestamp, 4999::numeric, 1200, 'live'),
  ('AWS Summit India', 'Cloud conference', 'conference', 'Hyderabad International Convention', '2025-07-17 09:00:00'::timestamp, 0::numeric, 2000, 'upcoming'),
  ('Zakir Khan Live', 'Stand up comedy', 'comedy', 'Chowdiah Hall, Bangalore', '2025-08-01 20:00:00'::timestamp, 999::numeric, 300, 'live'),
  ('KubeConf APAC', 'Kubernetes conference', 'conference', 'JNCC, Bangalore', '2025-09-26 09:00:00'::timestamp, 1500::numeric, 600, 'upcoming')
) AS v(title, description, category, venue, event_date, price, total_seats, status)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE events.title = v.title);


