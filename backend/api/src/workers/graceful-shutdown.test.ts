import { describe, expect, it, vi } from 'vitest';
import { createWorkerShutdown } from './graceful-shutdown.js';

describe('P578 bounded worker graceful shutdown', () => {
  it('stops schedulers, drains worker, closes queues and disconnects database in order', async () => {
    const order: string[] = [];
    const shutdown = createWorkerShutdown({
      clearTimers: () => { order.push('timers'); },
      closeWorker: async () => { order.push('worker'); },
      closeQueues: async () => { order.push('queues'); },
      disconnectDatabase: async () => { order.push('database'); },
    });
    await shutdown();
    expect(order).toEqual(['timers', 'worker', 'queues', 'database']);
  });

  it('is idempotent when SIGINT and SIGTERM overlap', async () => {
    const closeWorker = vi.fn(async () => { await Promise.resolve(); });
    const closeQueues = vi.fn(async () => undefined);
    const disconnectDatabase = vi.fn(async () => undefined);
    const shutdown = createWorkerShutdown({ clearTimers: vi.fn(), closeWorker, closeQueues, disconnectDatabase });
    await Promise.all([shutdown(), shutdown(), shutdown()]);
    expect(closeWorker).toHaveBeenCalledTimes(1);
    expect(closeQueues).toHaveBeenCalledTimes(1);
    expect(disconnectDatabase).toHaveBeenCalledTimes(1);
  });

  it('continues cleanup after a worker drain failure and reports all failures', async () => {
    const order: string[] = [];
    const shutdown = createWorkerShutdown({
      clearTimers: () => order.push('timers'),
      closeWorker: async () => { order.push('worker'); throw new Error('drain failed'); },
      closeQueues: async () => { order.push('queues'); },
      disconnectDatabase: async () => { order.push('database'); },
    });
    await expect(shutdown()).rejects.toThrow('Worker shutdown completed with cleanup errors');
    expect(order).toEqual(['timers', 'worker', 'queues', 'database']);
  });

  it('bounds a hung worker drain and still closes queues and database', async () => {
    const order: string[] = [];
    const shutdown = createWorkerShutdown({
      clearTimers: () => order.push('timers'),
      closeWorker: () => new Promise(() => undefined),
      closeQueues: async () => { order.push('queues'); },
      disconnectDatabase: async () => { order.push('database'); },
      stepTimeoutMs: 10,
    });
    await expect(shutdown()).rejects.toThrow('Worker shutdown completed with cleanup errors');
    expect(order).toEqual(['timers', 'queues', 'database']);
  });

  it('attempts database disconnect when queue close fails', async () => {
    const disconnectDatabase = vi.fn(async () => undefined);
    const shutdown = createWorkerShutdown({
      clearTimers: vi.fn(), closeWorker: vi.fn(async () => undefined),
      closeQueues: async () => { throw new Error('queue close failed'); },
      disconnectDatabase,
    });
    await expect(shutdown()).rejects.toThrow(AggregateError);
    expect(disconnectDatabase).toHaveBeenCalledTimes(1);
  });
});
