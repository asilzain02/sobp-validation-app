import { Router } from 'express';
import { getCounter, incrementCounter } from '../services/database';

export const counterRouter = Router();

counterRouter.get('/counter', async (_request, response, next) => {
  try {
    const counter = await getCounter();
    response.json(counter);
  } catch (error) {
    next(error);
  }
});

counterRouter.post('/counter/increment', async (_request, response, next) => {
  try {
    const counter = await incrementCounter();
    console.log(`INFO Counter incremented to ${counter.value}`);
    response.json(counter);
  } catch (error) {
    next(error);
  }
});
