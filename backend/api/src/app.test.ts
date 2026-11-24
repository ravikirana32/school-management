import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from './app.js';

describe('API foundation', () => {
  it('returns liveness status', async () => {
    const response = await request(app).get('/health/live');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ok');
  });

  it('returns API version information', async () => {
    const response = await request(app).get('/api/v1');
    expect(response.status).toBe(200);
    expect(response.body.data.version).toBe('v1');
  });

  it('returns a consistent not-found error', async () => {
    const response = await request(app).get('/does-not-exist');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
