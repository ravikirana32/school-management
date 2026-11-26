import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./tokens.js";
import { isMfaEnabled } from "./mfa-policy.js";
import { prisma } from "../../lib/prisma.js";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; sessionId: string; isPlatformAdmin: boolean; mfaVerifiedAt: Date | null };
    }
  }
}

const MFA_BOOTSTRAP_ROUTES = new Set([
  "GET /me",
  "GET /mfa/status",
  "POST /mfa/totp/enroll",
  "POST /mfa/verify",
]);

/**
 * Enforces MFA for every API route that uses authenticate(). Only identity and
 * MFA bootstrap routes are reachable before enrollment/challenge completion.
 * Platform-admin policy is mandatory; additional role keys are deployment-configured.
 */
async function enforceRequiredMfa(req: Request, res: Response): Promise<boolean> {
  const routeKey = `${req.method.toUpperCase()} ${req.path}`;
  if (!isMfaEnabled() || MFA_BOOTSTRAP_ROUTES.has(routeKey)) return true;

  const configuredRoleKeys = (process.env.MFA_REQUIRED_ROLE_KEYS || "")
    .split(",").map(value => value.trim()).filter(Boolean);
  let required = Boolean(req.auth?.isPlatformAdmin);

  if (!required && configuredRoleKeys.length) {
    const assignment = await prisma.userRoleAssignment.findFirst({
      where: { userId: req.auth!.userId, role: { key: { in: configuredRoleKeys } } },
      select: { id: true }
    });
    required = Boolean(assignment);
  }
  if (!required) return true;

  const factor = await prisma.mfaFactor.findFirst({
    where: { userId: req.auth!.userId, factorType: "TOTP", disabledAt: null, verifiedAt: { not: null } },
    select: { id: true }
  });
  const verifiedAt = req.auth!.mfaVerifiedAt;
  const ageMs = verifiedAt ? Date.now() - verifiedAt.getTime() : Number.POSITIVE_INFINITY;
  const fresh = ageMs >= 0 && ageMs <= 5 * 60 * 1000;

  if (!factor) {
    res.status(403).json({
      error: "Multi-factor authentication enrollment is required",
      code: "MFA_ENROLLMENT_REQUIRED",
      action: { method: "POST", endpoint: "/api/v1/auth/mfa/totp/enroll" }
    });
    return false;
  }
  if (!fresh) {
    res.status(403).json({
      error: "Fresh multi-factor authentication verification is required",
      code: "MFA_CHALLENGE_REQUIRED",
      action: { method: "POST", endpoint: "/api/v1/auth/mfa/verify" },
      freshnessSeconds: 300
    });
    return false;
  }
  return true;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Authentication required" });
    const claims = await verifyAccessToken(header.slice(7));
    const session = await prisma.userSession.findFirst({
      where: { id: claims.sessionId, userId: claims.sub, status: "ACTIVE", expiresAt: { gt: new Date() } },
      select: { id: true, mfaVerifiedAt: true }
    });
    if (!session) return res.status(401).json({ error: "Authentication required" });
    const user = await prisma.user.findUnique({
      where: { id: claims.sub }, select: { isPlatformAdmin: true, isActive: true }
    });
    if (!user?.isActive) return res.status(401).json({ error: "Authentication required" });
    req.auth = { userId: claims.sub, sessionId: claims.sessionId, isPlatformAdmin: user.isPlatformAdmin, mfaVerifiedAt: session.mfaVerifiedAt };
    if (!await enforceRequiredMfa(req, res)) return;
    return next();
  } catch {
    return res.status(401).json({ error: "Authentication required" });
  }
}
