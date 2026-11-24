import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './lib/prisma.js';
import { closeReadinessConnections } from './health/readiness.js';

const server = app.listen(env.API_PORT, env.API_HOST, () => {
  logger.info({ host: env.API_HOST, port: env.API_PORT }, 'School SaaS API listening');
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown requested');
  const forceExit = setTimeout(() => {
    logger.error({ signal }, 'Graceful shutdown timed out');
    process.exit(1);
  }, 10_000);
  forceExit.unref();
  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
    await Promise.all([prisma.$disconnect(), closeReadinessConnections()]);
    clearTimeout(forceExit);
    logger.info({ signal }, 'Graceful shutdown completed');
    process.exitCode = 0;
  } catch (error) {
    clearTimeout(forceExit);
    logger.error({ err: error, signal }, 'Graceful shutdown failed');
    process.exitCode = 1;
  }
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
