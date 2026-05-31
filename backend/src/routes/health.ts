import { Router } from 'express';
import { healthState, isUnhealthy } from '../services/simulationState';

export const healthRouter = Router();

healthRouter.get('/health', (_request, response) => {
  if (isUnhealthy()) {
    response.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      unhealthyUntil: new Date(healthState.unhealthyUntil).toISOString()
    });
    return;
  }

  response.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});
