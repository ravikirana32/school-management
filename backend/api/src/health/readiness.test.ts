import { describe, expect, it, vi } from 'vitest';
import { probeReadiness } from './readiness.js';

describe('P71 readiness probes', () => {
  it('reports ready only when both database and Redis respond', async () => {
    const result = await probeReadiness({ database: vi.fn().mockResolvedValue(1), redis: vi.fn().mockResolvedValue('PONG') });
    expect(result).toEqual({ status: 'ok', checks: { configuration: 'ok', database: 'ok', redis: 'ok' } });
  });

  it('degrades when PostgreSQL is unavailable without exposing driver errors', async () => {
    const result = await probeReadiness({ database: vi.fn().mockRejectedValue(new Error('private connection string')), redis: vi.fn().mockResolvedValue('PONG') });
    expect(result.status).toBe('degraded');
    expect(result.checks).toEqual({ configuration: 'ok', database: 'error', redis: 'ok' });
    expect(JSON.stringify(result)).not.toContain('private connection string');
  });

  it('degrades when Redis is unavailable', async () => {
    const result = await probeReadiness({ database: vi.fn().mockResolvedValue(1), redis: vi.fn().mockRejectedValue(new Error('redis secret')) });
    expect(result.checks.redis).toBe('error');
    expect(result.status).toBe('degraded');
  });

  it('probes dependencies concurrently', async () => {
    let dbDone = false;
    let redisDone = false;
    const result = await probeReadiness({
      database: async () => { await Promise.resolve(); dbDone = true; return 1; },
      redis: async () => { await Promise.resolve(); redisDone = true; return 'PONG'; },
    });
    expect(dbDone && redisDone).toBe(true);
    expect(result.status).toBe('ok');
  });
});

it('degrades when a dependency probe exceeds its bounded timeout', async () => {
  const result = await probeReadiness({
    database: () => new Promise(() => {}),
    redis: async () => 'PONG',
  });
  expect(result.status).toBe('degraded');
  expect(result.checks.database).toBe('error');
  expect(result.checks.redis).toBe('ok');
});
