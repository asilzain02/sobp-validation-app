const express = require('express');

const app = express();
const PORT = Number(process.env.PORT || 3004);
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003';

app.use(express.json());

function log(message, details = {}) {
  console.log(JSON.stringify({ service: 'tracking-service', message, ...details, timestamp: new Date().toISOString() }));
}

async function getPaymentStatus() {
  const response = await fetch(`${PAYMENT_SERVICE_URL}/payment/status`);
  if (!response.ok) {
    throw new Error(`payment-service returned ${response.status}`);
  }
  return response.json();
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'tracking-service', dependencies: { paymentService: PAYMENT_SERVICE_URL } });
});

app.get('/track', async (_req, res) => {
  try {
    const paymentStatus = await getPaymentStatus();
    const tracking = {
      orderId: paymentStatus.latest.orderId || 'latest-order',
      paymentStatus: paymentStatus.latest.status,
      deliveryStatus: paymentStatus.latest.status === 'paid' ? 'driver-assigned' : 'waiting-for-payment'
    };
    log('tracking requested', tracking);
    res.json({ tracking, dependency: PAYMENT_SERVICE_URL });
  } catch (error) {
    log('tracking dependency check failed', { error: error.message });
    res.status(502).json({ error: 'payment dependency unavailable', dependency: PAYMENT_SERVICE_URL });
  }
});

app.listen(PORT, () => {
  log('started', { port: PORT, health: '/health', dependency: PAYMENT_SERVICE_URL, env: 'PAYMENT_SERVICE_URL' });
});
