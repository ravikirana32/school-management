import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { z } from 'zod';

// pnpm runs this package with backend/api as the working directory.
// Load the repository-root .env by default; ENV_FILE can override it.
dotenv.config({ path: process.env.ENV_FILE ?? '../../.env' });

// Resolve Docker/Kubernetes mounted secret files without placing secret values in
// command-line arguments or committed environment files.
const secretFileMappings: Record<string, string> = {
  DATABASE_URL: "DATABASE_URL_FILE",
  REDIS_URL: "REDIS_URL_FILE",
  JWT_ACCESS_SECRET: "JWT_ACCESS_SECRET_FILE",
  JWT_REFRESH_SECRET: "JWT_REFRESH_SECRET_FILE",
  PLATFORM_SECRET_ENCRYPTION_KEY: "PLATFORM_SECRET_ENCRYPTION_KEY_FILE",
  PARENT_INVITE_ENCRYPTION_KEY: "PARENT_INVITE_ENCRYPTION_KEY_FILE",
  METRICS_BEARER_TOKEN: "METRICS_BEARER_TOKEN_FILE",
  DOCUMENT_SCAN_WEBHOOK_SECRET: "DOCUMENT_SCAN_WEBHOOK_SECRET_FILE",
  PARENT_EMAIL_PROVIDER_TOKEN: "PARENT_EMAIL_PROVIDER_TOKEN_FILE",
  NOTIFICATION_EMAIL_PROVIDER_TOKEN: "NOTIFICATION_EMAIL_PROVIDER_TOKEN_FILE",
  NOTIFICATION_EMAIL_WEBHOOK_SECRET: "NOTIFICATION_EMAIL_WEBHOOK_SECRET_FILE",
  DOCUMENT_SCANNER_PROVIDER_TOKEN: "DOCUMENT_SCANNER_PROVIDER_TOKEN_FILE",
  OPERATIONS_ALERT_WEBHOOK_TOKEN: "OPERATIONS_ALERT_WEBHOOK_TOKEN_FILE",
  NOTIFICATION_SUPPRESSION_HASH_SECRET: "NOTIFICATION_SUPPRESSION_HASH_SECRET_FILE",
  NOTIFICATION_SUPPRESSION_HASH_CURRENT_SECRET: "NOTIFICATION_SUPPRESSION_HASH_CURRENT_SECRET_FILE",
  NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_SECRET: "NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_SECRET_FILE",
  S3_ACCESS_KEY_ID: "S3_ACCESS_KEY_ID_FILE",
  S3_SECRET_ACCESS_KEY: "S3_SECRET_ACCESS_KEY_FILE",
};
for (const [target, fileVariable] of Object.entries(secretFileMappings)) {
  const filePath = process.env[fileVariable];
  if (filePath && !process.env[target]) {
    try {
      const secretValue = readFileSync(filePath, "utf8").trim();
      if (secretValue) process.env[target] = secretValue;
    } catch {
      throw new Error(`Unable to load required mounted secret for ${target}.`);
    }
  }
}

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(8080),
  API_HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  MFA_ENABLED: z.enum(["true", "false"]).default("false").transform(value => value === "true"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  PLATFORM_SECRET_ENCRYPTION_KEY: z.string().min(32).optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  METRICS_BEARER_TOKEN: z.string().min(32).optional(),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default('ap-south-1'),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.string().default("false").transform(value => value === "true"),
  PARENT_INVITE_ENCRYPTION_KEY: z.string().optional(),
  DOCUMENT_SCAN_WEBHOOK_SECRET: z.string().min(32).optional(),
  PARENT_EMAIL_PROVIDER_URL: z.string().url().optional(),
  PARENT_EMAIL_PROVIDER_TOKEN: z.string().optional(),
  PARENT_EMAIL_FROM: z.string().email().optional(),
  PARENT_PORTAL_BASE_URL: z.string().url().optional(),
  NOTIFICATION_EMAIL_PROVIDER_URL: z.string().url().optional(),
  NOTIFICATION_EMAIL_PROVIDER_TOKEN: z.string().optional(),
  NOTIFICATION_EMAIL_FROM: z.string().email().optional(),
  ORGANIZATION_ADMIN_INVITATION_BASE_URL: z.string().url().optional(),
  NOTIFICATION_EMAIL_WEBHOOK_SECRET: z.string().min(32).optional(),
  NOTIFICATION_EMAIL_WEBHOOK_PROVIDER: z.string().regex(/^[a-z0-9][a-z0-9-]{1,59}$/).optional(),
  NOTIFICATION_SUPPRESSION_HASH_SECRET: z.string().min(32).optional(),
  NOTIFICATION_SUPPRESSION_HASH_CURRENT_SECRET: z.string().min(32).optional(),
  NOTIFICATION_SUPPRESSION_HASH_CURRENT_VERSION: z.string().regex(/^[a-zA-Z0-9_-]{1,20}$/).default("v1"),
  NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_SECRET: z.string().min(32).optional(),
  NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_VERSION: z.string().regex(/^[a-zA-Z0-9_-]{1,20}$/).optional(),
  REPORT_CARD_VERIFY_BASE_URL: z.string().url().optional(),
  DOCUMENT_SCANNER_PROVIDER_URL: z.string().url().optional(),
  DOCUMENT_SCANNER_PROVIDER_TOKEN: z.string().optional(),
  DOCUMENT_SCAN_CALLBACK_URL: z.string().url().optional(),
  OPERATIONS_ALERT_WEBHOOK_URL: z.string().url().optional(),
  OPERATIONS_ALERT_WEBHOOK_TOKEN: z.string().optional(),
  DOCUMENT_WORKER_FAILURE_ALERT_THRESHOLD: z.coerce.number().int().min(1).max(20).default(3),
  DOCUMENT_WORKER_STALE_AFTER_SECONDS: z.coerce.number().int().min(60).max(3600).default(120),
  REMINDER_AUDIT_EXPORT_WORKER_ALERT_STALE_SECONDS: z.coerce.number().int().min(60).max(3600).default(120),
  REMINDER_AUDIT_EXPORT_WORKER_ALERT_DEGRADED_FAILURES: z.coerce.number().int().min(1).max(20).default(3),
  REMINDER_AUDIT_EXPORT_WORKER_ALERT_ESCALATE_AFTER_SECONDS: z.coerce.number().int().min(300).max(86400).default(1800),
});

const productionSchema = schema.superRefine((value, context) => {
  if (value.NODE_ENV !== "production") return;
  const required: Array<[keyof typeof value, string]> = [
    ["PLATFORM_SECRET_ENCRYPTION_KEY", "PLATFORM_SECRET_ENCRYPTION_KEY is required in production."],
    ["PARENT_INVITE_ENCRYPTION_KEY", "PARENT_INVITE_ENCRYPTION_KEY is required in production."],
    ["METRICS_BEARER_TOKEN", "METRICS_BEARER_TOKEN is required in production."],
    ["NOTIFICATION_SUPPRESSION_HASH_CURRENT_SECRET", "NOTIFICATION_SUPPRESSION_HASH_CURRENT_SECRET is required in production."],
    ["S3_BUCKET", "S3_BUCKET is required in production."],
    ["PARENT_PORTAL_BASE_URL", "PARENT_PORTAL_BASE_URL is required in production."],
    ["REPORT_CARD_VERIFY_BASE_URL", "REPORT_CARD_VERIFY_BASE_URL is required in production."],
  ];
  for (const [key, message] of required) {
    if (!value[key]) context.addIssue({ code: "custom", path: [key], message });
  }
  if (value.PARENT_INVITE_ENCRYPTION_KEY && Buffer.from(value.PARENT_INVITE_ENCRYPTION_KEY, "base64").length !== 32) {
    context.addIssue({ code: "custom", path: ["PARENT_INVITE_ENCRYPTION_KEY"], message: "Parent invitation encryption key must be base64 for exactly 32 bytes." });
  }
  for (const key of ["PARENT_PORTAL_BASE_URL", "REPORT_CARD_VERIFY_BASE_URL", "ORGANIZATION_ADMIN_INVITATION_BASE_URL"] as const) {
    const url = value[key];
    if (url && !url.startsWith("https://")) context.addIssue({ code: "custom", path: [key], message: `${key} must use HTTPS in production.` });
  }
  if (value.JWT_ACCESS_SECRET === value.JWT_REFRESH_SECRET) {
    context.addIssue({ code: "custom", path: ["JWT_REFRESH_SECRET"], message: "Access and refresh signing secrets must be different." });
  }
  if (value.REDIS_URL && !new URL(value.REDIS_URL).password) {
    context.addIssue({ code: "custom", path: ["REDIS_URL"], message: "Redis authentication is required in production." });
  }
  const origins = value.CORS_ORIGINS.split(",").map(origin => origin.trim());
  if (origins.some(origin => origin === "*" || origin.startsWith("http://localhost") || !origin.startsWith("https://"))) {
    context.addIssue({ code: "custom", path: ["CORS_ORIGINS"], message: "Production CORS origins must be explicit HTTPS origins; wildcards and localhost are forbidden." });
  }
  if (Boolean(value.S3_ACCESS_KEY_ID) !== Boolean(value.S3_SECRET_ACCESS_KEY)) {
    context.addIssue({ code: "custom", path: ["S3_ACCESS_KEY_ID"], message: "S3 access key and secret must be configured together, or both omitted when using workload identity." });
  }
  const providerPairs: Array<[string, unknown[]]> = [
    ["PARENT_EMAIL_PROVIDER", [value.PARENT_EMAIL_PROVIDER_URL, value.PARENT_EMAIL_PROVIDER_TOKEN, value.PARENT_EMAIL_FROM]],
    ["NOTIFICATION_EMAIL_PROVIDER", [value.NOTIFICATION_EMAIL_PROVIDER_URL, value.NOTIFICATION_EMAIL_PROVIDER_TOKEN, value.NOTIFICATION_EMAIL_FROM]],
    ["DOCUMENT_SCANNER_PROVIDER", [value.DOCUMENT_SCANNER_PROVIDER_URL, value.DOCUMENT_SCANNER_PROVIDER_TOKEN]],
  ];
  for (const [name, fields] of providerPairs) {
    if (fields.some(Boolean) && !fields.every(Boolean)) context.addIssue({ code: "custom", path: [name], message: `${name} endpoint, token and required sender fields must be configured together.` });
  }
});
const parsed = productionSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Environment validation failed. Check .env.example and local .env.');
}
export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGINS.split(',').map((value) => value.trim());
