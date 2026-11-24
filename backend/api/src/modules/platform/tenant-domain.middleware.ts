import type { Request, Response, NextFunction } from "express";
import { withPlatformContext } from "../auth/tenant-context.js";
import { prisma } from "../../lib/prisma.js";

declare global {
  namespace Express {
    interface Request {
      tenantRouting?: { organizationId: string; hostname: string };
    }
  }
}

/**
 * Resolves active custom domains and binds the request to one tenant.
 * Tenant-scoped URL families are rejected when their organization segment
 * does not match the host mapping. Platform/public routes remain host-neutral.
 */
export async function resolveTenantDomain(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.path.startsWith("/api/v1/")) return next();
    const rawHost = String(req.get("host") || "").split(":")[0].toLowerCase().replace(/\.$/, "");
    if (!rawHost || rawHost === "localhost" || rawHost.endsWith(".localhost")) return next();
    const mapping = await withPlatformContext(prisma, tx => tx.tenantCustomDomain.findFirst({
      where: { hostname: rawHost, status: "ACTIVE" },
      select: { organizationId: true, hostname: true }
    }));
    if (!mapping) return next();
    req.tenantRouting = { organizationId: mapping.organizationId, hostname: mapping.hostname };

    const segments = req.path.split("/").filter(Boolean);
    if (segments[0] === "api" && segments[1] === "v1") {
      const route = segments[2];
      if (route === "platform" || route === "public" || route === "auth" || route === "webhooks") return next();
      const orgId = ["organizations", "billing", "schools"].includes(route) ? segments[3] : route;
      if (orgId && orgId !== mapping.organizationId) {
        return res.status(404).json({ error: "Tenant route does not match this custom domain" });
      }
    }
    return next();
  } catch {
    return res.status(503).json({ error: "Tenant domain routing is temporarily unavailable" });
  }
}
