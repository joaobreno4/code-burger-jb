const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { withResponseTime, handleDbError } = require('./_lib/observe');

const SECRET = process.env.JWT_SECRET || 'codeburger-dev-secret-change-in-prod';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Runs once per warm instance; idempotent — safe on every cold start.
let dbReady = false;

async function ensureDbReady() {
  if (dbReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      username      VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at    TIMESTAMPTZ  DEFAULT NOW()
    )
  `);

  // ON CONFLICT handles the rare race between two simultaneous cold starts.
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  if (rows[0].count === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
      ['admin', hash]
    );
    console.log(`[${new Date().toISOString()}] [SEED] Admin user created in Neon DB`);
  }

  dbReady = true;
}

module.exports = async (req, res) => {
  withResponseTime(res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username e password são obrigatórios.' });
  }

  try {
    await ensureDbReady();

    const { rows } = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );
    const user = rows[0];
    const valid = user !== undefined && await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ sub: user.username, role: 'admin' }, SECRET, { expiresIn: '8h' });
    console.log(`[${new Date().toISOString()}] INFO POST /api/login — ${username} authenticated`);
    return res.json({ token });
  } catch (err) {
    return handleDbError(res, err);
  }
};
