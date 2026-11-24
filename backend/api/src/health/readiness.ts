import Redis from 'ioredis';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

export type ReadinessDependencies = { database: () => Promise<unknown>; redis: () => Promise<unknown> };
export type ReadinessResult = { status: 'ok' | 'degraded'; checks: { configuration: 'ok'; database: 'ok' | 'error'; redis: 'ok' | 'error' } };

const redisClient = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, enableOfflineQueue: false, connectTimeout: 1500 });

async function boundedProbe(probe: () => Promise<unknown>, timeoutMs = 2000): Promise<'ok' | 'error'> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([probe(), new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error('Readiness probe timed out')), timeoutMs);
      timeout.unref?.();
    })]);
    return 'ok';
  } catch { return 'error'; }
  finally { if (timeout) clearTimeout(timeout); }
}

export async function probeReadiness(dependencies: ReadinessDependencies): Promise<ReadinessResult> {
  const [database, redis] = await Promise.all([boundedProbe(dependencies.database), boundedProbe(dependencies.redis)]);
  return { status: database === 'ok' && redis === 'ok' ? 'ok' : 'degraded', checks: { configuration: 'ok', database, redis } };
}

export function getReadiness() {
  return probeReadiness({ database: () => prisma.$queryRaw`SELECT 1`, redis: () => redisClient.ping() });
}

export async function closeReadinessConnections() {
  if (redisClient.status === 'ready') await redisClient.quit();
  else redisClient.disconnect();
}
