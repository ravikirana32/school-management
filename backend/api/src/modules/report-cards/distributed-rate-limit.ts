import Redis from "ioredis";
import { createHash } from "node:crypto";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  connectTimeout: 1500,
});
const incrementScript = `local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]); end; local ttl = redis.call('PTTL', KEYS[1]); return {count, ttl}`;

export async function consumeVerificationRateLimit(identity: string, limit = 30, windowMs = 60_000): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(windowMs) || windowMs < 1000) throw new Error("Invalid rate-limit configuration");
  if (redis.status === "wait") await redis.connect();
  const digest = createHash("sha256").update(identity || "unknown").digest("hex");
  const result = await redis.eval(incrementScript, 1, `public:report-card-verify:${digest}`, String(windowMs)) as [number | string, number | string];
  const count = Number(result[0]);
  const ttl = Math.max(1000, Number(result[1]));
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfterSeconds: Math.ceil(ttl / 1000) };
}

export async function closeVerificationRateLimitConnection() { await redis.quit(); }
