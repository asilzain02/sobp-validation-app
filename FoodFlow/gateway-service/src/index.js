const express = require('express');

const app = express();
const PORT = Number(process.env.PORT || 8080);

const services = {
  food: process.env.FOOD_SERVICE_URL || 'http://localhost:3001',
  order: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
  tracking: process.env.TRACKING_SERVICE_URL || 'http://localhost:3004'
};

app.use(express.json());

function log(message, details = {}) {
  console.log(JSON.stringify({ service: 'gateway-service', message, ...details, timestamp: new Date().toISOString() }));
}

async function callService(name, path, options = {}) {
  const url = `${services[name]}${path}`;
  log('proxying request', { dependency: name, url });
  const response = await fetch(url, options);
  const text = await response.text();
  try {
    return { status: response.status, body: JSON.parse(text) };
  } catch (_error) {
    return { status: response.status, body: { raw: text } };
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gateway-service', dependencies: services });
});

app.get('/', async (_req, res) => {
  const checks = await Promise.allSettled([
    callService('food', '/health'),
    callService('order', '/health'),
    callService('payment', '/health'),
    callService('tracking', '/health')
  ]);

  res.json({
    application: 'FoodFlow',
    description: 'Mini Food Delivery Platform - SOBP V0.4 discovery test fixture',
    routes: {
      foods: '/api/foods',
      order: '/api/order',
      pay: '/api/pay',
      track: '/api/track'
    },
    dependencies: services,
    checks: checks.map((check) => (check.status === 'fulfilled' ? check.value : { status: 503, body: { error: check.reason.message } }))
  });
});

app.get('/api/foods', async (_req, res) => {
  const result = await callService('food', '/foods');
  res.status(result.status).json(result.body);
});

app.get('/api/food/:id', async (req, res) => {
  const result = await callService('food', `/food/${req.params.id}`);
  res.status(result.status).json(result.body);
});

app.post('/api/order', async (req, res) => {
  const result = await callService('order', '/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  res.status(result.status).json(result.body);
});

app.get('/api/order', async (_req, res) => {
  const result = await callService('order', '/order');
  res.status(result.status).json(result.body);
});

app.post('/api/pay', async (req, res) => {
  const result = await callService('payment', '/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  res.status(result.status).json(result.body);
});

app.get('/api/payment/status', async (_req, res) => {
  const result = await callService('payment', '/payment/status');
  res.status(result.status).json(result.body);
});

app.get('/api/track', async (_req, res) => {
  const result = await callService('tracking', '/track');
  res.status(result.status).json(result.body);
});

app.listen(PORT, () => {
  log('started', { port: PORT, health: '/health', dependencies: Object.keys(services) });
});
