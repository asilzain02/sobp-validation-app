import { Router } from 'express';
import { allocateTemporaryMemory, markUnhealthy, startCpuLoad } from '../services/simulationState';

export const simulateRouter = Router();

simulateRouter.post('/simulate/cpu', (_request, response) => {
  startCpuLoad();
  console.warn('WARNING CPU load simulation started for 30 seconds');
  response.accepted().json({
    status: 'cpu_load_started',
    durationSeconds: 30,
    timestamp: new Date().toISOString()
  });
});

simulateRouter.post('/simulate/memory', (_request, response) => {
  allocateTemporaryMemory();
  console.warn('WARNING Memory load simulation started with 128MB allocation for 30 seconds');
  response.accepted().json({
    status: 'memory_load_started',
    sizeMb: 128,
    durationSeconds: 30,
    timestamp: new Date().toISOString()
  });
});

simulateRouter.post('/simulate/crash', (_request, response) => {
  console.error('ERROR Crash simulation requested. Process will exit in 250ms.');
  response.accepted().json({
    status: 'crash_scheduled',
    timestamp: new Date().toISOString()
  });

  setTimeout(() => {
    process.exit(1);
  }, 250).unref();
});

simulateRouter.post('/simulate/unhealthy', (_request, response) => {
  const unhealthyUntil = markUnhealthy();
  console.warn(`WARNING Healthcheck forced unhealthy until ${unhealthyUntil.toISOString()}`);
  response.accepted().json({
    status: 'unhealthy_started',
    durationSeconds: 60,
    unhealthyUntil: unhealthyUntil.toISOString()
  });
});
