import Redis from "ioredis";
import { createHash } from "node:crypto";
import type { Request, Response } from "express";
import { env } from "../../config/env.js";

const redis = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, enableOfflineQueue: false, connectTimeout: 1500 });
const incrementScript = `local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]); end; local ttl = redis.call('PTTL', KEYS[1]); return {count, ttl}`;
const digest = (value: string) => createHash("sha256").update(value || "unknown").digest("hex");

/** Shared Redis-backed public admissions limiter. Fail closed if Redis is unavailable. */
export async function admissionPublicRateLimit(req: Request, res: Response, limit = 12, windowMs = 60_000): Promise<boolean> {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const org = String(req.params.organizationId || "unknown-org");
  const school = String(req.params.schoolId || "unknown-school");
  const route = String((req.route as any)?.path || req.path).replace(/:[^/]+/g, ":param");
  const key = `public:admissions:rate:${digest(`${org}:${school}:${route}:${ip}`)}`;
  try {
    if (redis.status === "wait") await redis.connect();
    const result = await redis.eval(incrementScript, 1, key, String(windowMs)) as [number | string, number | string];
    const count = Number(result[0]);
    const retryAfter = Math.max(1, Math.ceil(Number(result[1]) / 1000));
    if (count > limit) {
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({ error: "Too many requests. Please retry later." });
      return false;
    }
    return true;
  } catch {
    res.status(503).json({ error: "Public admissions service temporarily unavailable. Please retry later." });
    return false;
  }
}
export async function closeAdmissionPublicRateLimitConnection() { if (redis.status === "ready") await redis.quit(); else redis.disconnect(); }
