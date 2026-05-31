import { getCounter } from './database';

export function startRuntimeLogGenerator(): void {
  setInterval(async () => {
    try {
      const counter = await getCounter();
      console.log(`INFO App running at ${new Date().toISOString()}`);
      console.log(`INFO Counter value ${counter.value}`);
      console.warn('WARNING High load simulation log entry');
      console.error('ERROR Fake recoverable error for log pipeline validation');
    } catch (error) {
      console.error('ERROR Runtime log generator failed', error);
    }
  }, 10_000).unref();
}
