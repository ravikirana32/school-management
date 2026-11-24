import { describe, expect, it, beforeEach } from 'vitest';
import { EventEmitter } from 'node:events';
import { renderRequestMetrics, requestMetricsMiddleware, resetRequestMetricsForTests } from './request-metrics.js';

describe('P77 request metrics', () => {
  beforeEach(() => resetRequestMetricsForTests());
  it('records method, status and route template without raw URL parameters', () => {
    const req = { method: 'GET', baseUrl: '/api/v1/students', route: { path: '/:organizationId/:schoolId' } } as any;
    const res = new EventEmitter() as any;
    res.statusCode = 200;
    requestMetricsMiddleware(req, res, () => undefined);
    res.emit('finish');
    const output = renderRequestMetrics();
    expect(output).toContain('method="GET",status="200",route="/api/v1/students/:organizationId/:schoolId"');
    expect(output).not.toContain('student-secret-id');
  });
  it('exports Prometheus counters and duration sums', () => {
    const req = { method: 'POST', baseUrl: '/api/v1/auth', route: { path: '/login' } } as any;
    const res = new EventEmitter() as any;
    res.statusCode = 401;
    requestMetricsMiddleware(req, res, () => undefined);
    res.emit('finish');
    const output = renderRequestMetrics();
    expect(output).toContain('# TYPE school_saas_http_requests_total counter');
    expect(output).toContain('school_saas_http_request_duration_seconds_sum');
    expect(output).toContain('status="401"');
  });
});
