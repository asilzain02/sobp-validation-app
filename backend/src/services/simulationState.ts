export interface HealthState {
  unhealthyUntil: number;
}

export const healthState: HealthState = {
  unhealthyUntil: 0
};

const memoryPressureBlocks: Buffer[] = [];

export function markUnhealthy(durationMs = 60_000): Date {
  healthState.unhealthyUntil = Date.now() + durationMs;
  return new Date(healthState.unhealthyUntil);
}

export function isUnhealthy(): boolean {
  return Date.now() < healthState.unhealthyUntil;
}

export function startCpuLoad(durationMs = 30_000): void {
  const endTime = Date.now() + durationMs;

  const burn = (): void => {
    const chunkEnd = Date.now() + 250;
    while (Date.now() < chunkEnd) {
      Math.sqrt(Math.random() * Number.MAX_SAFE_INTEGER);
    }

    if (Date.now() < endTime) {
      setImmediate(burn);
    }
  };

  setImmediate(burn);
}

export function allocateTemporaryMemory(sizeMb = 128, durationMs = 30_000): void {
  const block = Buffer.alloc(sizeMb * 1024 * 1024, 'sobp-validation');
  memoryPressureBlocks.push(block);

  setTimeout(() => {
    const index = memoryPressureBlocks.indexOf(block);
    if (index >= 0) {
      memoryPressureBlocks.splice(index, 1);
    }
  }, durationMs).unref();
}
