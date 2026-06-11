const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'status is required' });

      const { rowCount, rows } = await pool.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );
      if (!rowCount) return res.status(404).json({ error: 'Order not found' });

      const r = rows[0];
      return res.json({ id: r.id, clientName: r.client_name, order: r.order, status: r.status });
    }

    if (req.method === 'DELETE') {
      const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
      if (!rowCount) return res.status(404).json({ error: 'Order not found' });
      return res.status(204).end();
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
