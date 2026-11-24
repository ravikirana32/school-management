import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import Redis from "ioredis";
import { env } from "../../config/env.js";

const redis = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, enableOfflineQueue: false, connectTimeout: 1500 });
const incrementScript = `local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]); end; local ttl = redis.call('PTTL', KEYS[1]); return {count, ttl}`;

type Limit = { scope: string; limit: number; windowMs: number; identity: (req: Request) => string };
const digest = (value: string) => createHash("sha256").update(value || "unknown").digest("hex");
const ip = (req: Request) => req.ip || req.socket.remoteAddress || "unknown";
const email = (req: Request) => typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "missing-email";

async function consume(scope: string, identity: string, limit: number, windowMs: number) {
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(windowMs) || windowMs < 1000) throw new Error("Invalid authentication rate-limit configuration");
  if (redis.status === "wait") await redis.connect();
  const key = `auth:rate:${scope}:${digest(identity)}`;
  const result = await redis.eval(incrementScript, 1, key, String(windowMs)) as [number | string, number | string];
  const count = Number(result[0]);
  const ttl = Math.max(1000, Number(result[1]));
  return { allowed: count <= limit, retryAfterSeconds: Math.ceil(ttl / 1000) };
}

const allowedAbuseEvents = new Set(["login_succeeded", "login_failed", "rate_limited", "refresh_reuse", "refresh_concurrent_reuse", "login_cooldown", "mfa_failed"]);
const alertThresholds: Record<string, number> = { login_failed: 20, rate_limited: 10, refresh_reuse: 1, refresh_concurrent_reuse: 1, login_cooldown: 5, mfa_failed: 5 };
const ALERT_STREAM = "auth:security:alerts";
const DAY_SECONDS = 60 * 60 * 24;
const utcDay = () => new Date().toISOString().slice(0, 10);

/** Best-effort, privacy-safe counters. Only fixed event labels and integer counts are stored. */
export async function recordAuthAbuseEvent(event: string) {
  if (!allowedAbuseEvents.has(event)) return;
  try {
    if (redis.status === "wait") await redis.connect();
    const key = `auth:abuse:daily:${utcDay()}`;
    const result = await redis.multi().hincrby(key, event, 1).expire(key, 60 * 60 * 24 * 35).exec();
    const count = Number(result?.[0]?.[1] ?? 0);
    const threshold = alertThresholds[event];
    if (threshold && count >= threshold) {
      const dedupeKey = `auth:security:alerted:${utcDay()}:${event}`;
      const claimed = await redis.set(dedupeKey, "1", "EX", DAY_SECONDS * 35, "NX");
      if (claimed === "OK") {
        await redis.xadd(ALERT_STREAM, "MAXLEN", "~", "500", "*", "event", event, "count", String(count), "occurredAt", new Date().toISOString());
        await redis.expire(ALERT_STREAM, DAY_SECONDS * 35);
      }
    }
  } catch {
    // Metrics must never change authentication decisions or expose identity data.
  }
}

export async function readAuthAbuseSummary(days = 7) {
  if (!Number.isInteger(days) || days < 1 || days > 7) throw new Error("Invalid summary window");
  if (redis.status === "wait") await redis.connect();
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date(); date.setUTCDate(date.getUTCDate() - index); return date.toISOString().slice(0, 10);
  });
  const rows = await Promise.all(dates.map(date => redis.hgetall(`auth:abuse:daily:${date}`)));
  const totals: Record<string, number> = Object.fromEntries([...allowedAbuseEvents].map(event => [event, 0]));
  rows.forEach(row => Object.entries(row).forEach(([event, count]) => {
    if (allowedAbuseEvents.has(event)) totals[event] += Number(count) || 0;
  }));
  const alertRows = await redis.xrevrange(ALERT_STREAM, "+", "-", "COUNT", 50);
  const alerts = alertRows.map((row: any[]) => {
    const fields = row[1] as string[];
    const values: Record<string, string> = {};
    for (let index = 0; index < fields.length; index += 2) values[fields[index]] = fields[index + 1];
    return { event: values.event, count: Number(values.count || 0), occurredAt: values.occurredAt };
  }).filter((item: any) => allowedAbuseEvents.has(item.event));
  return { windowDays: days, totals, daily: dates.map((date, index) => ({ date, ...Object.fromEntries([...allowedAbuseEvents].map(event => [event, Number(rows[index][event] || 0)])) })), alerts };
}

/** Progressive cooldown is scoped to the account+source-IP pair to reduce the risk
 * of a third party locking an account merely by targeting its email address. */
export async function loginProgressiveProtection(req: Request, res: Response, next: NextFunction) {
  try {
    const identity = `${email(req)}\u0000${ip(req)}`;
    if (redis.status === "wait") await redis.connect();
    const cooldownKey = `auth:login:cooldown:${digest(identity)}`;
    const ttl = await redis.pttl(cooldownKey);
    if (ttl > 0) return res.status(401).json({ error: "Invalid credentials" });
    return next();
  } catch {
    return res.status(503).json({ error: "Authentication service temporarily unavailable" });
  }
}

export async function recordLoginFailure(account: string, sourceIp: string) {
  try {
    if (redis.status === "wait") await redis.connect();
    const identity = `${account.trim().toLowerCase()}\u0000${sourceIp || "unknown"}`;
    const key = `auth:login:failures:${digest(identity)}`;
    const count = Number(await redis.incr(key));
    if (count === 1) await redis.expire(key, 15 * 60);
    if (count >= 5) {
      const cooldownSeconds = count >= 8 ? 5 * 60 : 60;
      await redis.set(`auth:login:cooldown:${digest(identity)}`, "1", "EX", cooldownSeconds);
      await recordAuthAbuseEvent("login_cooldown");
    }
  } catch {
    // The existing login IP/account limiter remains the primary fail-closed guard.
  }
}

export async function clearLoginFailure(account: string, sourceIp: string) {
  try {
    if (redis.status === "wait") await redis.connect();
    const identity = `${account.trim().toLowerCase()}\u0000${sourceIp || "unknown"}`;
    const suffix = digest(identity);
    await redis.del(`auth:login:failures:${suffix}`, `auth:login:cooldown:${suffix}`);
  } catch { /* best-effort reset only; authentication remains successful */ }
}

export function authRateLimit(...limits: Limit[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const rule of limits) {
        const result = await consume(rule.scope, rule.identity(req), rule.limit, rule.windowMs);
        if (!result.allowed) {
          await recordAuthAbuseEvent("rate_limited");
          res.setHeader("Retry-After", String(result.retryAfterSeconds));
          return res.status(429).json({ error: "Too many requests. Please try again later." });
        }
      }
      return next();
    } catch {
      // Fail closed: an unavailable limiter must not silently disable auth abuse controls.
      return res.status(503).json({ error: "Authentication service temporarily unavailable" });
    }
  };
}

const minute = 60_000;
export const loginRateLimit = authRateLimit(
  { scope: "login-ip", limit: 30, windowMs: 15 * minute, identity: ip },
  { scope: "login-account", limit: 10, windowMs: 15 * minute, identity: email },
);
export const refreshRateLimit = authRateLimit({ scope: "refresh-ip", limit: 90, windowMs: 15 * minute, identity: ip });
export const registerRateLimit = authRateLimit({ scope: "register-ip", limit: 8, windowMs: 60 * minute, identity: ip });
export const passwordForgotRateLimit = authRateLimit(
  { scope: "password-forgot-ip", limit: 5, windowMs: 60 * minute, identity: ip },
  { scope: "password-forgot-account", limit: 3, windowMs: 60 * minute, identity: email },
);
export const passwordResetRateLimit = authRateLimit({ scope: "password-reset-ip", limit: 10, windowMs: 60 * minute, identity: ip });

export async function closeAuthRateLimitConnection() { await redis.quit(); }

export const mfaChallengeRateLimit = authRateLimit(
  { scope: "mfa-challenge-ip", limit: 30, windowMs: 15 * minute, identity: ip },
  { scope: "mfa-challenge-user", limit: 10, windowMs: 15 * minute, identity: (req) => req.auth?.userId || "unauthenticated" },
);
export const mfaEnrollRateLimit = authRateLimit(
  { scope: "mfa-enroll-ip", limit: 10, windowMs: 60 * minute, identity: ip },
  { scope: "mfa-enroll-user", limit: 3, windowMs: 60 * minute, identity: (req) => req.auth?.userId || "unauthenticated" },
);
