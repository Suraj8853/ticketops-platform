const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'ticketops',
  user: process.env.DB_USER || 'ticketops',
  password: process.env.DB_PASSWORD || 'ticketops',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DB_HOST === 'pgbouncer-service' ? false : 
       process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
});

module.exports = pool;
