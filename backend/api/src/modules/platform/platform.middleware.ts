import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";

/** Requires a valid P02 bearer session and a platform-admin identity flag. */
export async function requirePlatformAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth?.userId) return res.status(401).json({ error: "Authentication required" });
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: { isPlatformAdmin: true, isActive: true }
    });
    if (!user?.isActive || !user.isPlatformAdmin) {
      return res.status(403).json({ error: "Platform administrator access required" });
    }
    const factor = await prisma.mfaFactor.findFirst({
      where: { userId: req.auth.userId, factorType: "TOTP", disabledAt: null, verifiedAt: { not: null } },
      select: { id: true }
    });
    const mfaAgeMs = req.auth.mfaVerifiedAt ? Date.now() - req.auth.mfaVerifiedAt.getTime() : Number.POSITIVE_INFINITY;
    const freshMfa = mfaAgeMs >= 0 && mfaAgeMs <= 5 * 60 * 1000;
    if (!factor || !freshMfa) {
      return res.status(403).json({ error: "Platform administrator access requires enrolled MFA and fresh verification within five minutes" });
    }
    return next();
  } catch {
    return res.status(500).json({ error: "Unable to verify platform access" });
  }
}
