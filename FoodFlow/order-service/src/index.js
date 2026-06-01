const express = require('express');

const app = express();
const PORT = Number(process.env.PORT || 3002);
const FOOD_SERVICE_URL = process.env.FOOD_SERVICE_URL || 'http://localhost:3001';
const orders = [];

app.use(express.json());

function log(message, details = {}) {
  console.log(JSON.stringify({ service: 'order-service', message, ...details, timestamp: new Date().toISOString() }));
}

async function getFood(foodId) {
  const response = await fetch(`${FOOD_SERVICE_URL}/food/${foodId}`);
  if (!response.ok) {
    throw new Error(`food-service returned ${response.status}`);
  }
  return response.json();
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'order-service', dependencies: { foodService: FOOD_SERVICE_URL } });
});

app.post('/order', async (req, res) => {
  const foodId = String(req.body.foodId || '1');

  try {
    const { food } = await getFood(foodId);
    const order = {
      id: `ord-${Date.now()}`,
      food,
      quantity: Number(req.body.quantity || 1),
      status: 'created'
    };
    orders.push(order);
    log('created order', { orderId: order.id, foodId });
    res.status(201).json({ order, dependency: FOOD_SERVICE_URL });
  } catch (error) {
    log('failed to create order', { foodId, error: error.message });
    res.status(502).json({ error: 'food dependency unavailable', dependency: FOOD_SERVICE_URL });
  }
});

app.get('/order', (_req, res) => {
  log('listing orders', { count: orders.length });
  res.json({ orders, dependency: FOOD_SERVICE_URL });
});

app.listen(PORT, () => {
  log('started', { port: PORT, health: '/health', dependency: FOOD_SERVICE_URL, env: 'FOOD_SERVICE_URL' });
});
