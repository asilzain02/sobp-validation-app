const express = require('express');

const app = express();
const PORT = Number(process.env.PORT || 3003);
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';
const payments = [];

app.use(express.json());

function log(message, details = {}) {
  console.log(JSON.stringify({ service: 'payment-service', message, ...details, timestamp: new Date().toISOString() }));
}

async function verifyOrdersEndpoint() {
  const response = await fetch(`${ORDER_SERVICE_URL}/order`);
  if (!response.ok) {
    throw new Error(`order-service returned ${response.status}`);
  }
  return response.json();
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'payment-service', dependencies: { orderService: ORDER_SERVICE_URL } });
});

app.post('/pay', async (req, res) => {
  try {
    await verifyOrdersEndpoint();
    const payment = {
      id: `pay-${Date.now()}`,
      orderId: req.body.orderId || 'latest-order',
      status: 'paid',
      amount: Number(req.body.amount || 12.99)
    };
    payments.push(payment);
    log('mock payment accepted', { paymentId: payment.id, orderId: payment.orderId });
    res.status(201).json({ payment, dependency: ORDER_SERVICE_URL });
  } catch (error) {
    log('payment dependency check failed', { error: error.message });
    res.status(502).json({ error: 'order dependency unavailable', dependency: ORDER_SERVICE_URL });
  }
});

app.get('/payment/status', (_req, res) => {
  const latest = payments[payments.length - 1] || { status: 'no-payments-yet' };
  log('payment status requested', { status: latest.status });
  res.json({ latest, payments, dependency: ORDER_SERVICE_URL });
});

app.listen(PORT, () => {
  log('started', { port: PORT, health: '/health', dependency: ORDER_SERVICE_URL, env: 'ORDER_SERVICE_URL' });
});
