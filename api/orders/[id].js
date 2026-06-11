const { Pool } = require('pg');
const { logRequest, handleDbError, jsonLog } = require('../_lib/observe');
const { verifyToken } = require('../_lib/auth');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  logRequest(req, res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing order id in request path.' });
  }

  if (!verifyToken(req)) {
    return res.status(401).json({ error: 'Token de autenticação necessário.' });
  }

  try {
    if (req.method === 'PUT') {
      const { status } = req.body || {};

      if (!status) {
        jsonLog('warn', { message: 'PUT /api/orders — missing status in body', orderId: id });
        return res.status(400).json({ error: 'status is required' });
      }

      const { rowCount, rows } = await pool.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (!rowCount) {
        jsonLog('warn', { message: 'PUT /api/orders — order not found', orderId: id });
        return res.status(404).json({ error: 'Order not found' });
      }

      const r = rows[0];
      return res.json({ id: r.id, clientName: r.client_name, order: r.order, status: r.status });
    }

    if (req.method === 'DELETE') {
      const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [id]);

      if (!rowCount) {
        jsonLog('warn', { message: 'DELETE /api/orders — order not found', orderId: id });
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return handleDbError(res, err);
  }
};
