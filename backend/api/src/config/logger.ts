import pino from 'pino';
import { env } from './env.js';
import { LOG_REDACTION_PATHS } from './log-redaction.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: [...LOG_REDACTION_PATHS],
});
