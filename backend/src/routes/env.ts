import { Router } from 'express';

export const envRouter = Router();

envRouter.get('/env', (_request, response) => {
  response.json({
    appName: process.env.APP_NAME ?? null,
    environment: process.env.ENVIRONMENT ?? null,
    customSecret: process.env.CUSTOM_SECRET ? 'loaded' : 'missing'
  });
});
