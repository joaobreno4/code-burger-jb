const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Order, User } = require('./models');
const menu = require('./data/menu.json');
const { requireAuth } = require('./middleware/auth');
const { version } = require('../package.json');

const router = Router();
const SECRET = process.env.JWT_SECRET || 'codeburger-dev-secret-change-in-prod';

router.get('/health', (_req, res) => {
  return res.json({ status: 'ok', version });
});

router.get('/', (_req, res) => {
  return res.json({
    status: 'ok',
    message: 'Code-Burger API running',
    endpoints: ['GET /health', 'GET /menu', 'POST /login', 'GET /orders', 'POST /orders', 'PUT /orders/:id', 'DELETE /orders/:id'],
  });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username e password são obrigatórios.' });
  }
  try {
    const user = await User.findOne({ where: { username } });
    const valid = user !== null && await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const token = jwt.sign({ sub: user.username, role: 'admin' }, SECRET, { expiresIn: '8h' });
    return res.json({ token });
  } catch (_err) {
    return res.status(500).json({ error: 'Erro interno ao autenticar.' });
  }
});

router.get('/menu', (_req, res) => {
  return res.json(menu);
});

router.get('/orders', requireAuth, async (_req, res) => {
  try {
    const orders = await Order.findAll();
    return res.json(orders);
  } catch (_err) {
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/orders', async (req, res) => {
  const { clientName, order } = req.body;
  if (!clientName || !order) {
    return res.status(400).json({ error: 'clientName and order are required' });
  }
  try {
    const newOrder = await Order.create({ clientName, order });
    return res.status(201).json(newOrder);
  } catch (_err) {
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/orders/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }
  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    await order.update({ status });
    return res.json(order);
  } catch (_err) {
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

router.delete('/orders/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Order.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.status(204).send();
  } catch (_err) {
    return res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
