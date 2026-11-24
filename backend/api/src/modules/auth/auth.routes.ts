import { Router } from "express";
import { registerSchema, loginSchema, refreshSchema } from "./auth.schemas.js";
import { hashPassword, verifyPassword, createOpaqueToken, hashOpaqueToken } from "./security.js";
import { issueAccessToken } from "./tokens.js";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "./auth.middleware.js";
import { withIdentityContext } from "./tenant-context.js";
import { loginRateLimit, refreshRateLimit, registerRateLimit, passwordForgotRateLimit, passwordResetRateLimit, recordAuthAbuseEvent, readAuthAbuseSummary, loginProgressiveProtection, recordLoginFailure, clearLoginFailure, mfaChallengeRateLimit, mfaEnrollRateLimit } from "./auth-rate-limit.js";
import { requirePlatformAdmin } from "../platform/platform.middleware.js";
import { decryptMfaSecret, encryptMfaSecret, hashRecoveryCode, newRecoveryCode, newTotpSecret, validTotpStep } from "./mfa.js";

export const authRouter = Router();

function asyncRoute(fn: (req: any, res: any) => Promise<unknown>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res)).catch(next);
}

authRouter.get("/security/abuse-summary", authenticate, requirePlatformAdmin, asyncRoute(async (req, res) => {
  try { return res.json({ data: await readAuthAbuseSummary(7) }); }
  catch { return res.status(503).json({ error: "Security metrics temporarily unavailable" }); }
}));

authRouter.post("/register", registerRateLimit, asyncRoute(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid registration details" });
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ error: "Account cannot be created with these details" });
  const user = await prisma.user.create({
    data: { email: parsed.data.email, displayName: parsed.data.displayName, passwordHash: await hashPassword(parsed.data.password) },
    select: { id: true, email: true, displayName: true, createdAt: true }
  });
  return res.status(201).json({ user });
}));

authRouter.post("/login", loginRateLimit, loginProgressiveProtection, asyncRoute(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid credentials" });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isActive || !(await verifyPassword(user.passwordHash, parsed.data.password))) {
    await recordAuthAbuseEvent("login_failed");
    await recordLoginFailure(parsed.data.email, req.ip);
    return res.status(401).json({ error: "Invalid credentials" });
  }
  await clearLoginFailure(parsed.data.email, req.ip);
  await recordAuthAbuseEvent("login_succeeded");
  const refreshToken = createOpaqueToken();
  const session = await prisma.userSession.create({
    data: {
      userId: user.id, refreshTokenHash: hashOpaqueToken(refreshToken), tokenFamilyId: createOpaqueToken(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent: req.get("user-agent"), ipAddress: req.ip
    }
  });
  const accessToken = await issueAccessToken({ sub: user.id, sessionId: session.id });
  return res.json({ accessToken, refreshToken, tokenType: "Bearer", expiresIn: 600 });
}));

authRouter.post("/refresh", refreshRateLimit, asyncRoute(async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return res.status(401).json({ error: "Invalid refresh token" });
  const oldHash = hashOpaqueToken(parsed.data.refreshToken);
  const session = await prisma.userSession.findUnique({ where: { refreshTokenHash: oldHash } });
  if (!session) return res.status(401).json({ error: "Invalid refresh token" });
  const now = new Date();
  if (session.status !== "ACTIVE") {
    // A previously rotated token is evidence of possible theft. Revoke every
    // still-active session in its family; never reveal whether the token existed.
    if (session.tokenFamilyId) {
      await recordAuthAbuseEvent("refresh_reuse");
      await prisma.$transaction(async tx => {
        await tx.userSession.updateMany({
          where: { userId: session.userId, tokenFamilyId: session.tokenFamilyId, status: "ACTIVE" },
          data: { status: "REVOKED", revokedAt: now }
        });
        await tx.auditLog.create({ data: {
          actorUserId: session.userId, action: "auth.refresh_token.reuse_detected",
          resourceType: "UserSession", resourceId: session.id, outcome: "DENIED",
          ipAddress: req.ip, userAgent: req.get("user-agent"),
          metadata: { tokenFamilyId: session.tokenFamilyId }
        }});
      });
    }
    return res.status(401).json({ error: "Invalid refresh token" });
  }
  if (session.expiresAt <= now) {
    await prisma.userSession.updateMany({ where: { id: session.id, status: "ACTIVE" }, data: { status: "EXPIRED" } });
    return res.status(401).json({ error: "Invalid refresh token" });
  }
  const nextToken = createOpaqueToken();
  const familyId = session.tokenFamilyId ?? session.id;
  const nextSession = await prisma.$transaction(async tx => {
    const updated = await tx.userSession.updateMany({
      where: { id: session.id, status: "ACTIVE", refreshTokenHash: oldHash },
      data: { status: "REVOKED", revokedAt: now, tokenFamilyId: familyId, lastUsedAt: now }
    });
    if (updated.count !== 1) return null;
    const created = await tx.userSession.create({
      data: {
        userId: session.userId, refreshTokenHash: hashOpaqueToken(nextToken), tokenFamilyId: familyId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userAgent: req.get("user-agent"), ipAddress: req.ip
      }
    });
    await tx.userSession.update({ where: { id: session.id }, data: { replacedBySessionId: created.id } });
    await tx.auditLog.create({ data: {
      actorUserId: session.userId, action: "auth.session.rotated", resourceType: "UserSession",
      resourceId: created.id, outcome: "SUCCESS", ipAddress: req.ip, userAgent: req.get("user-agent"),
      metadata: { previousSessionId: session.id, tokenFamilyId: familyId }
    }});
    return created;
  });
  if (!nextSession) {
    // A competing refresh may have won the atomic claim after our initial read.
    // Fail closed: revoke the family so a parallel replay cannot keep the winner alive.
    await recordAuthAbuseEvent("refresh_concurrent_reuse");
    await prisma.$transaction(async tx => {
      await tx.userSession.updateMany({
        where: { userId: session.userId, tokenFamilyId: familyId, status: "ACTIVE" },
        data: { status: "REVOKED", revokedAt: new Date() }
      });
      await tx.auditLog.create({ data: {
        actorUserId: session.userId, action: "auth.refresh_token.concurrent_reuse_detected",
        resourceType: "UserSession", resourceId: session.id, outcome: "DENIED",
        ipAddress: req.ip, userAgent: req.get("user-agent"), metadata: { tokenFamilyId: familyId }
      }});
    });
    return res.status(401).json({ error: "Invalid refresh token" });
  }
  const accessToken = await issueAccessToken({ sub: session.userId, sessionId: nextSession.id });
  return res.json({ accessToken, refreshToken: nextToken, tokenType: "Bearer", expiresIn: 600 });
}));

authRouter.post("/logout", asyncRoute(async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (parsed.success) {
    await prisma.userSession.updateMany({
      where: { refreshTokenHash: hashOpaqueToken(parsed.data.refreshToken), status: "ACTIVE" },
      data: { status: "REVOKED", revokedAt: new Date() }
    });
  }
  return res.status(204).send();
}));


// Session inventory and revocation are always scoped to the authenticated user.
authRouter.get("/sessions", authenticate, asyncRoute(async (req, res) => {
  const sessions = await prisma.userSession.findMany({
    where: { userId: req.auth!.userId, status: "ACTIVE", expiresAt: { gt: new Date() } },
    select: { id: true, deviceName: true, userAgent: true, ipAddress: true, createdAt: true, lastUsedAt: true, expiresAt: true },
    orderBy: { lastUsedAt: "desc" }
  });
  return res.json({ sessions: sessions.map(session => ({ ...session, isCurrent: session.id === req.auth!.sessionId })) });
}));

authRouter.delete("/sessions/:sessionId", authenticate, asyncRoute(async (req, res) => {
  const sessionId = typeof req.params.sessionId === "string" ? req.params.sessionId : "";
  if (!sessionId || sessionId.length > 128) return res.status(400).json({ error: "Invalid session identifier" });
  const result = await prisma.userSession.updateMany({
    where: { id: sessionId, userId: req.auth!.userId, status: "ACTIVE" },
    data: { status: "REVOKED", revokedAt: new Date() }
  });
  if (result.count) await prisma.auditLog.create({ data: {
    actorUserId: req.auth!.userId, action: "auth.session.revoked", resourceType: "UserSession",
    resourceId: sessionId, outcome: "SUCCESS", ipAddress: req.ip, userAgent: req.get("user-agent"),
    metadata: { initiatedFromSessionId: req.auth!.sessionId }
  }});
  return res.status(204).send();
}));

authRouter.post("/sessions/revoke-others", authenticate, asyncRoute(async (req, res) => {
  const now = new Date();
  const result = await prisma.userSession.updateMany({
    where: { userId: req.auth!.userId, status: "ACTIVE", id: { not: req.auth!.sessionId } },
    data: { status: "REVOKED", revokedAt: now }
  });
  await prisma.auditLog.create({ data: {
    actorUserId: req.auth!.userId, action: "auth.sessions.revoke_others", resourceType: "UserSession",
    resourceId: req.auth!.sessionId, outcome: "SUCCESS", ipAddress: req.ip, userAgent: req.get("user-agent"),
    metadata: { revokedCount: result.count }
  }});
  return res.json({ revokedCount: result.count });
}));



/** Returns the signed-in identity and only that user's own membership/role rows.
 * Tenant records are intentionally not loaded through an unscoped query. */
authRouter.get("/me", authenticate, asyncRoute(async (req, res) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: "Authentication required" });

  const [user, identity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, emailVerifiedAt: true, phoneVerifiedAt: true, isPlatformAdmin: true }
    }),
    withIdentityContext(prisma, userId, async (tx) => {
      const [organizations, schools, assignments] = await Promise.all([
        tx.organizationMembership.findMany({
          where: { userId },
          select: { id: true, organizationId: true, status: true, joinedAt: true },
          orderBy: { createdAt: "asc" }
        }),
        tx.schoolMembership.findMany({
          where: { userId },
          select: { id: true, organizationId: true, schoolId: true, status: true, joinedAt: true },
          orderBy: { createdAt: "asc" }
        }),
        tx.userRoleAssignment.findMany({
          where: { userId },
          select: { id: true, scopeType: true, organizationId: true, schoolId: true, role: {
            select: { key: true, name: true, scopeType: true, rolePermissions: { select: { permission: { select: { key: true } } } } }
          } },
          orderBy: { createdAt: "asc" }
        })
      ]);
      return { organizations, schools, assignments };
    })
  ]);

  if (!user) return res.status(401).json({ error: "Authentication required" });
  const permissions = [...new Set(identity.assignments.flatMap((assignment) =>
    assignment.role.rolePermissions.map((item) => item.permission.key)
  ))].sort();
  return res.json({
    user,
    memberships: { organizations: identity.organizations, schools: identity.schools },
    roles: identity.assignments.map(({ id, scopeType, organizationId, schoolId, role }) => ({
      id, scopeType, organizationId, schoolId, key: role.key, name: role.name
    })),
    permissions
  });
}));

// TOTP enrollment is deliberately two-step: the pending factor is not trusted until a valid code is confirmed.
authRouter.post("/mfa/totp/enroll", authenticate, mfaEnrollRateLimit, asyncRoute(async (req, res) => {
  const existing = await prisma.mfaFactor.findFirst({ where: { userId: req.auth!.userId, factorType: "TOTP", disabledAt: null, verifiedAt: { not: null } } });
  if (existing) return res.status(409).json({ error: "An authenticator factor is already enrolled" });
  const secret = newTotpSecret();
  const secretCipher = encryptMfaSecret(secret);
  const priorPending = await prisma.mfaFactor.findFirst({ where: { userId: req.auth!.userId, factorType: "TOTP", disabledAt: null, verifiedAt: null } });
  const pendingFactor = priorPending
    ? await prisma.mfaFactor.update({ where: { id: priorPending.id }, data: { secretCipher, createdAt: new Date() } })
    : await prisma.mfaFactor.create({ data: { userId: req.auth!.userId, factorType: "TOTP", secretCipher } });
  await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "auth.mfa.enrollment_started", resourceType: "MfaFactor", resourceId: pendingFactor.id, outcome: "SUCCESS", ipAddress: req.ip, userAgent: req.get("user-agent") } });
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: { email: true } });
  const issuer = encodeURIComponent(process.env.MFA_TOTP_ISSUER || "School Management SaaS");
  const label = encodeURIComponent(`${issuer}:${user?.email || req.auth!.userId}`);
  const otpauthUri = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
  return res.status(201).json({ data: { secret, otpauthUri, algorithm: "SHA1", digits: 6, periodSeconds: 30, expiresInSeconds: 600 } });
}));

authRouter.post("/mfa/verify", authenticate, mfaChallengeRateLimit, asyncRoute(async (req, res) => {
  const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
  if (!code || code.length > 32) return res.status(400).json({ error: "Invalid verification code" });
  const factor = await prisma.mfaFactor.findFirst({ where: { userId: req.auth!.userId, factorType: "TOTP", disabledAt: null, secretCipher: { not: null } }, orderBy: { createdAt: "desc" } });
  if (!factor?.secretCipher) return res.status(404).json({ error: "Authenticator is not enrolled" });
  if (!factor.verifiedAt && Date.now() - factor.createdAt.getTime() > 10 * 60 * 1000) {
    await prisma.mfaFactor.update({ where: { id: factor.id }, data: { disabledAt: new Date() } });
    return res.status(410).json({ error: "MFA enrollment expired; start enrollment again" });
  }
  let valid = false;
  let totpStep: bigint | null = null;
  let recoveryCodeId: string | null = null;
  if (/^\d{6}$/.test(code)) {
    totpStep = validTotpStep(decryptMfaSecret(factor.secretCipher), code);
    valid = totpStep !== null;
  } else {
    const codeHash = hashRecoveryCode(code);
    const recovery = await prisma.mfaRecoveryCode.findUnique({ where: { codeHash } });
    if (recovery && recovery.userId === req.auth!.userId && !recovery.usedAt) {
      recoveryCodeId = recovery.id;
      valid = true;
    }
  }
  if (!valid) {
    await recordAuthAbuseEvent("mfa_failed");
    await prisma.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "auth.mfa.challenge_failed", resourceType: "MfaFactor", resourceId: factor.id, outcome: "DENIED", ipAddress: req.ip, userAgent: req.get("user-agent") } });
    return res.status(401).json({ error: "Invalid verification code" });
  }
  const now = new Date();
  const verificationCommitted = await prisma.$transaction(async tx => {
    if (totpStep !== null) {
      const claimed = await tx.mfaFactor.updateMany({
        where: { id: factor.id, disabledAt: null, OR: [{ lastTotpStep: null }, { lastTotpStep: { lt: totpStep } }] },
        data: { lastTotpStep: totpStep, verifiedAt: factor.verifiedAt ?? now }
      });
      if (claimed.count !== 1) return false;
    } else if (recoveryCodeId) {
      const factorClaimed = await tx.mfaFactor.updateMany({ where: { id: factor.id, disabledAt: null }, data: { verifiedAt: factor.verifiedAt ?? now } });
      if (factorClaimed.count !== 1) return false;
      const codeClaimed = await tx.mfaRecoveryCode.updateMany({ where: { id: recoveryCodeId, userId: req.auth!.userId, usedAt: null }, data: { usedAt: now } });
      if (codeClaimed.count !== 1) return false;
    }
    await tx.userSession.update({ where: { id: req.auth!.sessionId }, data: { mfaVerifiedAt: now } });
    await tx.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "auth.mfa.challenge_succeeded", resourceType: "UserSession", resourceId: req.auth!.sessionId, outcome: "SUCCESS", ipAddress: req.ip, userAgent: req.get("user-agent") } });
    return true;
  });
  if (!verificationCommitted) {
    await recordAuthAbuseEvent("mfa_failed");
    return res.status(401).json({ error: "Invalid verification code" });
  }
  // Recovery codes are issued once, at initial factor confirmation, and only their hashes are stored.
  let recoveryCodes: string[] | undefined;
  if (!factor.verifiedAt) {
    recoveryCodes = Array.from({ length: 10 }, newRecoveryCode);
    await prisma.mfaRecoveryCode.createMany({ data: recoveryCodes.map(value => ({ userId: req.auth!.userId, codeHash: hashRecoveryCode(value) })) });
  }
  return res.json({ data: { verified: true, mfaVerifiedAt: now.toISOString(), ...(recoveryCodes ? { recoveryCodes } : {}) } });
}));

authRouter.delete("/mfa/totp", authenticate, mfaChallengeRateLimit, asyncRoute(async (req, res) => {
  const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
  const factor = await prisma.mfaFactor.findFirst({ where: { userId: req.auth!.userId, factorType: "TOTP", disabledAt: null, verifiedAt: { not: null }, secretCipher: { not: null } } });
  if (!factor?.secretCipher) return res.status(401).json({ error: "Valid authenticator code required" });
  const step = validTotpStep(decryptMfaSecret(factor.secretCipher), code);
  if (step === null) return res.status(401).json({ error: "Valid authenticator code required" });
  const now = new Date();
  const disabled = await prisma.$transaction(async tx => {
    const claimed = await tx.mfaFactor.updateMany({
      where: { id: factor.id, OR: [{ lastTotpStep: null }, { lastTotpStep: { lt: step } }] },
      data: { lastTotpStep: step, disabledAt: now }
    });
    if (claimed.count !== 1) return false;
    await tx.mfaRecoveryCode.deleteMany({ where: { userId: req.auth!.userId } });
    await tx.userSession.updateMany({ where: { userId: req.auth!.userId, status: "ACTIVE" }, data: { mfaVerifiedAt: null } });
    await tx.auditLog.create({ data: { actorUserId: req.auth!.userId, action: "auth.mfa.factor_disabled", resourceType: "MfaFactor", resourceId: factor.id, outcome: "SUCCESS", ipAddress: req.ip, userAgent: req.get("user-agent") } });
    return true;
  });
  if (!disabled) return res.status(401).json({ error: "Valid authenticator code required" });
  return res.status(204).send();
}));

authRouter.get("/mfa/status", authenticate, asyncRoute(async (req, res) => {
  const [factor, remainingRecoveryCodes, user, assignments] = await Promise.all([
    prisma.mfaFactor.findFirst({ where: { userId: req.auth!.userId, factorType: "TOTP", disabledAt: null, verifiedAt: { not: null } }, select: { id: true, verifiedAt: true, createdAt: true } }),
    prisma.mfaRecoveryCode.count({ where: { userId: req.auth!.userId, usedAt: null } }),
    prisma.user.findUnique({ where: { id: req.auth!.userId }, select: { isPlatformAdmin: true } }),
    prisma.userRoleAssignment.findMany({ where: { userId: req.auth!.userId }, select: { role: { select: { key: true } } } })
  ]);
  const requiredRoleKeys = new Set((process.env.MFA_REQUIRED_ROLE_KEYS || "").split(",").map(value => value.trim()).filter(Boolean));
  const matchedRoles = assignments.map(item => item.role.key).filter(key => requiredRoleKeys.has(key));
  const required = Boolean(user?.isPlatformAdmin || matchedRoles.length);
  const verifiedAt = req.auth!.mfaVerifiedAt;
  const fresh = Boolean(verifiedAt && Date.now() - verifiedAt.getTime() <= 5 * 60 * 1000);
  return res.json({ data: {
    enrolled: Boolean(factor), verifiedAt: factor?.verifiedAt ?? null, remainingRecoveryCodes,
    currentSessionVerifiedAt: verifiedAt,
    policy: { required, reasons: [...(user?.isPlatformAdmin ? ["PLATFORM_ADMIN"] : []), ...matchedRoles.map(key => `ROLE:${key}`)], challengeRequired: required && Boolean(factor) && !fresh, enrollmentRequired: required && !factor, sessionFresh: fresh, freshnessSeconds: 300 }
  } });
}));

authRouter.post("/password/reset", passwordResetRateLimit, asyncRoute(async (req, res) => {
  const token = typeof req.body?.token === "string" ? req.body.token : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (token.length < 32 || token.length > 512 || password.length < 12 || password.length > 256) {
    return res.status(400).json({ error: "Invalid password reset details" });
  }
  const tokenHash = hashOpaqueToken(token);
  const now = new Date();
  const result = await prisma.$transaction(async tx => {
    const reset = await tx.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!reset || reset.consumedAt || reset.expiresAt <= now) return false;
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: reset.id, consumedAt: null, expiresAt: { gt: now } },
      data: { consumedAt: now }
    });
    if (claimed.count !== 1) return false;
    await tx.user.update({ where: { id: reset.userId }, data: { passwordHash: await hashPassword(password) } });
    await tx.userSession.updateMany({
      where: { userId: reset.userId, status: "ACTIVE" },
      data: { status: "REVOKED", revokedAt: now }
    });
    await tx.auditLog.create({ data: {
      actorUserId: reset.userId, action: "auth.password_reset.completed",
      resourceType: "User", resourceId: reset.userId, outcome: "SUCCESS"
    }});
    return true;
  });
  if (!result) return res.status(400).json({ error: "Reset token is invalid or expired" });
  return res.status(204).send();
}));

authRouter.post("/password/forgot", passwordForgotRateLimit, (_req, res) => {
  // Always return the same response to prevent account enumeration. Rate limiting
  // is active; real password-reset delivery remains disabled until a provider is configured.
  return res.status(202).json({ message: "If the account exists, reset instructions will be sent." });
});
