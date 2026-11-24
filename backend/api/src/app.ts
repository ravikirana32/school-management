import { healthRouter } from "./modules/health/health.routes.js";
import { financeConfigurationRouter } from "./modules/finance/finance-configuration.routes.js";
import { libraryRouter } from "./modules/library/library.routes.js";
import { transportRouter } from "./modules/transport/transport.routes.js";
import { hostelRouter } from "./modules/hostel/hostel.routes.js";
import { canteenRouter } from "./modules/canteen/canteen.routes.js";
import { payrollRouter } from "./modules/payroll/payroll.routes.js";
import { hrRouter } from "./modules/hr/hr.routes.js";
import { assessmentRouter } from "./modules/assessments/assessment.routes.js";
import { attendanceRouter } from "./modules/attendance/attendance.routes.js";
import { journeyRouter } from "./modules/journeys/journey.routes.js";
import { securityOperationsRouter } from "./modules/security-operations/security-operations.routes.js";
import { notificationDeliveryWebhookRouter } from "./modules/notifications/delivery-webhook.routes.js";
import { notificationSuppressionRouter } from "./modules/notifications/suppression.routes.js";
import { documentRouter, documentScanRouter } from "./modules/documents/document.routes.js";
import { governanceRouter } from "./modules/documents/governance.routes.js";
import { parentRouter } from "./modules/parents/parent.routes.js";
import { reportCardRouter } from "./modules/report-cards/report-card.routes.js";
import { reportCardVerificationRouter } from "./modules/report-cards/report-card-verification.routes.js";
import { accessRouter } from "./modules/access/access.routes.js";
import { staffRouter } from "./modules/staff/staff.routes.js";
import { teacherMembershipRouter } from "./modules/staff/teacher-membership.routes.js";
import { teacherTimetableRouter } from "./modules/staff/teacher-timetable.routes.js";
import { admissionRouter } from "./modules/admissions/admission.routes.js";
import { admissionPublicRouter } from "./modules/admissions/admission.public.routes.js";
import { studentRouter } from "./modules/students/student.routes.js";
import { curriculumRouter } from "./modules/curriculum/curriculum.routes.js";
import { schoolConfigRouter } from "./modules/schools/school-config.routes.js";
import { billingRouter } from "./modules/billing/billing.routes.js";
import { organizationRouter } from "./modules/organizations/organization.routes.js";
import { platformRouter, tenantPublicRouter } from "./modules/platform/platform.routes.js";
import { resolveTenantDomain } from "./modules/platform/tenant-domain.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { corsOrigins } from './config/env.js';
import { logger } from './config/logger.js';
import { getReadiness } from './health/readiness.js';
import { env } from './config/env.js';
import { renderRequestMetrics, requestMetricsMiddleware } from './observability/request-metrics.js';
import { requestTracingMiddleware } from './observability/request-tracing.js';
import { timingSafeEqual } from 'node:crypto';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buffer) => {
    (req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
  }
}));
app.use(requestTracingMiddleware);
app.use(pinoHttp({
  logger,
  genReqId: (req) => (req as Request).traceContext?.requestId || req.headers['x-request-id']?.toString() || randomUUID(),
  customProps: (req) => {
    const trace = (req as Request).traceContext;
    return { requestId: trace?.requestId || (req as Request & { id?: string }).id, traceId: trace?.traceId, spanId: trace?.spanId, parentSpanId: trace?.parentSpanId };
  },
}));
app.use(requestMetricsMiddleware);
app.use(resolveTenantDomain);

app.get('/health/live', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { status: 'ok', service: 'school-saas-api', timestamp: new Date().toISOString() } });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  const readiness = await getReadiness();
  res.status(readiness.status === 'ok' ? 200 : 503).json({ success: readiness.status === 'ok', data: readiness });
});

app.get('/internal/metrics', (req: Request, res: Response) => {
  const configured = env.METRICS_BEARER_TOKEN;
  const authorization = req.header('authorization') || '';
  const supplied = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!configured || Buffer.byteLength(configured) !== Buffer.byteLength(supplied) || !timingSafeEqual(Buffer.from(configured || ''), Buffer.from(supplied))) {
    return res.status(404).end();
  }
  res.type('text/plain; version=0.0.4; charset=utf-8').send(renderRequestMetrics());
});

app.get('/api/v1', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: { name: 'School Management SaaS API', version: 'v1', status: 'foundation' },
  });
});

// Intentional public endpoints: privacy-minimized/rate-limited report-card verification and public tenant discovery.
app.use("/api/v1/public", reportCardVerificationRouter);
app.use("/api/v1/public", tenantPublicRouter);
// Intentional public provider callback: raw-body HMAC, provider binding, rate limit and idempotency are enforced in the router.
app.use("/api/v1/webhooks/notifications", notificationDeliveryWebhookRouter);
app.use("/api/v1", notificationSuppressionRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", documentScanRouter);
app.use("/api/v1", parentRouter);
app.use("/api/v1", reportCardRouter);
app.use("/api/v1", documentRouter);
app.use("/api/v1", governanceRouter);

app.use("/api/v1/platform", platformRouter);

app.use("/api/v1/organizations", organizationRouter);

app.use("/api/v1/billing", billingRouter);

app.use("/api/v1/schools", schoolConfigRouter);
app.use("/api/v1/finance", financeConfigurationRouter);

app.use("/api/v1/curriculum", curriculumRouter);

app.use("/api/v1", studentRouter);
app.use("/api/v1", admissionRouter);
app.use("/api/v1", admissionPublicRouter);
app.use("/api/v1", staffRouter);
app.use("/api/v1", teacherMembershipRouter);
app.use("/api/v1", teacherTimetableRouter);
app.use("/api/v1", accessRouter);
app.use("/api/v1", attendanceRouter);
app.use("/api/v1", assessmentRouter);
app.use("/api/v1", healthRouter);
app.use("/api/v1", libraryRouter);
app.use("/api/v1", transportRouter);
app.use("/api/v1", hostelRouter);
app.use("/api/v1", canteenRouter);
app.use("/api/v1", payrollRouter);
app.use("/api/v1", hrRouter);
app.use("/api/v1", journeyRouter);
app.use("/api/v1", securityOperationsRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err: error }, 'Unhandled request error');
  const status = typeof error === "object" && error !== null && "status" in error ? Number((error as {status: unknown}).status) : 500;
  const safeStatus = Number.isInteger(status) && status >= 400 && status < 600 ? status : 500;
  const message = safeStatus === 500 ? "An unexpected error occurred" : (error as Error).message;
  res.status(safeStatus).json({ success: false, error: { code: safeStatus === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR", message } });
});
