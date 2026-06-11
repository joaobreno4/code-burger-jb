const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_name TEXT NOT NULL,
      "order" TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Em preparação',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

function toResponse(row) {
  return { id: row.id, clientName: row.client_name, order: row.order, status: row.status };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await ensureTable();

    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at ASC');
      return res.json(rows.map(toResponse));
    }

    if (req.method === 'POST') {
      const { clientName, order } = req.body;
      if (!clientName || !order) {
        return res.status(400).json({ error: 'clientName and order are required' });
      }
      const { rows } = await pool.query(
        'INSERT INTO orders (client_name, "order") VALUES ($1, $2) RETURNING *',
        [clientName, order]
      );
      return res.status(201).json(toResponse(rows[0]));
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
