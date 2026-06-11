const { Router } = require('express');
const { Order } = require('./models');

const router = Router();

router.get('/', (req, res) => {
  return res.json({
    status: 'ok',
    message: 'Code-Burguer API running',
    endpoints: ['GET /orders', 'POST /orders', 'PUT /orders/:id', 'DELETE /orders/:id'],
  });
});

router.get('/orders', async (req, res) => {
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

router.put('/orders/:id', async (req, res) => {
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

router.delete('/orders/:id', async (req, res) => {
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
