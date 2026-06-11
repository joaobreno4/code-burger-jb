const jwt = require('jsonwebtoken');
const { withResponseTime } = require('./_lib/observe');

const SECRET = process.env.JWT_SECRET || 'codeburger-dev-secret-change-in-prod';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

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
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ sub: username, role: 'admin' }, SECRET, { expiresIn: '8h' });
  console.log(`[${new Date().toISOString()}] INFO POST /api/login — admin authenticated`);
  return res.json({ token });
};
