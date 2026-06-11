const { Pool } = require('pg');
const { withResponseTime, handleDbError } = require('../_lib/observe');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  withResponseTime(res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // req.query.id is injected by Vercel's dynamic routing from the [id] filename.
  // Log full context upfront so every request is visible in the Vercel log panel.
  const { id } = req.query;
  console.log(
    `[${new Date().toISOString()}] ${req.method} /api/orders/${id ?? 'MISSING'} | ` +
    `body=${JSON.stringify(req.body ?? null)} | query=${JSON.stringify(req.query)}`
  );

  if (!id) {
    return res.status(400).json({ error: 'Missing order id in request path.' });
  }

  try {
    if (req.method === 'PUT') {
      // Guard against unparsed or missing body — Vercel auto-parses JSON bodies
      // when Content-Type is application/json, but we defend just in case.
      const { status } = req.body || {};

      if (!status) {
        console.warn(`[WARN] PUT /api/orders/${id} — missing status in body`);
        return res.status(400).json({ error: 'status is required' });
      }

      const { rowCount, rows } = await pool.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (!rowCount) {
        console.warn(`[WARN] PUT /api/orders/${id} — order not found`);
        return res.status(404).json({ error: 'Order not found' });
      }

      const r = rows[0];
      console.log(`[INFO] PUT /api/orders/${id} — updated to status="${status}"`);
      return res.json({ id: r.id, clientName: r.client_name, order: r.order, status: r.status });
    }

    if (req.method === 'DELETE') {
      const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [id]);

      if (!rowCount) {
        console.warn(`[WARN] DELETE /api/orders/${id} — order not found`);
        return res.status(404).json({ error: 'Order not found' });
      }

      console.log(`[INFO] DELETE /api/orders/${id} — removed`);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(
      `[ERROR] ${req.method} /api/orders/${id} — ${err.message}\n` +
      `  code=${err.code} stack=${err.stack}`
    );
    return handleDbError(res, err);
  }
};
