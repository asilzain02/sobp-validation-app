const express = require('express');
const foods = require('./data/foods.json');

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(express.json());

function log(message, details = {}) {
  console.log(JSON.stringify({ service: 'food-service', message, ...details, timestamp: new Date().toISOString() }));
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'food-service', dataSource: 'src/data/foods.json' });
});

app.get('/foods', (_req, res) => {
  log('listing foods', { count: foods.length });
  res.json({ foods });
});

app.get('/food/:id', (req, res) => {
  const food = foods.find((item) => item.id === req.params.id);
  log('fetching food', { id: req.params.id, found: Boolean(food) });

  if (!food) {
    return res.status(404).json({ error: 'food not found', id: req.params.id });
  }

  return res.json({ food });
});

app.listen(PORT, () => {
  log('started', { port: PORT, health: '/health', endpoints: ['/foods', '/food/:id'] });
});
