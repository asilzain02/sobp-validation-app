import path from 'node:path';
import express, { type ErrorRequestHandler } from 'express';
import { counterRouter } from './routes/counter';
import { envRouter } from './routes/env';
import { healthRouter } from './routes/health';
import { simulateRouter } from './routes/simulate';

export function createApp() {
  const app = express();
  const publicPath = path.join(process.cwd(), 'backend', 'public');

  app.use(express.json());
  app.use(express.static(publicPath));

  app.use(healthRouter);
  app.use(envRouter);
  app.use(counterRouter);
  app.use(simulateRouter);

  app.use((_request: unknown, response: { status: (code: number) => { json: (body: unknown) => void } }) => {
    response.status(404).json({
      error: 'not_found',
      timestamp: new Date().toISOString()
    });
  });

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    console.error('ERROR Request failed', error);
    response.status(500).json({
      error: 'internal_server_error',
      timestamp: new Date().toISOString()
    });
  };

  app.use(errorHandler);

  return app;
}
