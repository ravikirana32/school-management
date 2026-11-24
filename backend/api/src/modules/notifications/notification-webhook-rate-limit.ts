import Redis from "ioredis";
import { buildNotificationRateLimitKey } from "./notification-rate-limit-key.js";
import { env } from "../../config/env.js";

const redis = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, enableOfflineQueue: false, connectTimeout: 1500 });
const incrementScript = `local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]); end; local ttl = redis.call('PTTL', KEYS[1]); return {count, ttl}`;

export async function consumeNotificationRateLimit(scope: string, identity: string, limit = 120, windowMs = 60_000): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(windowMs) || windowMs < 1000) throw new Error("Invalid notification rate-limit configuration");
  if (redis.status === "wait") await redis.connect();
  const key = buildNotificationRateLimitKey(scope, identity);
  const result = await redis.eval(incrementScript, 1, key, String(windowMs)) as [number | string, number | string];
  const count = Number(result[0]);
  const ttl = Math.max(1000, Number(result[1]));
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfterSeconds: Math.ceil(ttl / 1000) };
}

export async function closeNotificationRateLimitConnection() { await redis.quit(); }
