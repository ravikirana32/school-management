import type { Prisma, PrismaClient } from "@prisma/client";

export type TenantScope = { organizationId: string; schoolId?: string; userId?: string };

type ContextFlags = {
  platformAdmin?: boolean;
  parentDeliveryWorker?: boolean;
  documentScanWorker?: boolean;
  notificationWorker?: boolean;
  reportCardVerification?: boolean;
};

/**
 * Clear every transaction-local identity/worker selector before applying a context.
 * This is important when helpers are composed or reused from a transaction that has
 * already established a more privileged service context.
 */
async function resetDatabaseContext(tx: Prisma.TransactionClient): Promise<void> {
  await tx.$executeRaw`SELECT set_config('app.current_organization_id', '', true)`;
  await tx.$executeRaw`SELECT set_config('app.current_school_id', '', true)`;
  await tx.$executeRaw`SELECT set_config('app.current_user_id', '', true)`;
  await tx.$executeRaw`SELECT set_config('app.is_platform_admin', 'false', true)`;
  await tx.$executeRaw`SELECT set_config('app.parent_delivery_worker', 'false', true)`;
  await tx.$executeRaw`SELECT set_config('app.document_scan_worker', 'false', true)`;
  await tx.$executeRaw`SELECT set_config('app.notification_worker', 'false', true)`;
  await tx.$executeRaw`SELECT set_config('app.report_card_verification', 'false', true)`;
}

async function setDatabaseContext(
  tx: Prisma.TransactionClient,
  values: { organizationId?: string; schoolId?: string; userId?: string } & ContextFlags,
): Promise<void> {
  await resetDatabaseContext(tx);
  if (values.organizationId) {
    await tx.$executeRaw`SELECT set_config('app.current_organization_id', ${values.organizationId}, true)`;
  }
  if (values.schoolId) {
    await tx.$executeRaw`SELECT set_config('app.current_school_id', ${values.schoolId}, true)`;
  }
  if (values.userId) {
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${values.userId}, true)`;
  }
  if (values.platformAdmin) await tx.$executeRaw`SELECT set_config('app.is_platform_admin', 'true', true)`;
  if (values.parentDeliveryWorker) await tx.$executeRaw`SELECT set_config('app.parent_delivery_worker', 'true', true)`;
  if (values.documentScanWorker) await tx.$executeRaw`SELECT set_config('app.document_scan_worker', 'true', true)`;
  if (values.notificationWorker) await tx.$executeRaw`SELECT set_config('app.notification_worker', 'true', true)`;
  if (values.reportCardVerification) await tx.$executeRaw`SELECT set_config('app.report_card_verification', 'true', true)`;
}

/** Tenant work must use only the transaction client passed to the callback. */
export async function withTenantContext<T>(
  prisma: PrismaClient,
  scope: TenantScope,
  work: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  if (!scope.organizationId) throw new Error("Organization scope is required");
  return prisma.$transaction(async (tx) => {
    await setDatabaseContext(tx, scope);
    return work(tx);
  });
}

/** Allows a user to read only their own membership rows without knowing tenant IDs. */
export async function withIdentityContext<T>(
  prisma: PrismaClient,
  userId: string,
  work: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  if (!userId) throw new Error("User identity is required");
  return prisma.$transaction(async (tx) => {
    await setDatabaseContext(tx, { userId });
    return work(tx);
  });
}

/** Platform-only query helper for RLS-protected tenant tables. */
export async function withPlatformContext<T>(
  prisma: PrismaClient,
  work: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await setDatabaseContext(tx, { platformAdmin: true });
    return work(tx);
  });
}

/** Restricted service context for the dedicated parent delivery worker.
 * Deployment must use a separate worker database credential and never expose
 * this context to request handlers. */
export async function withParentWorkerContext<T>(
  prisma: PrismaClient,
  work: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await setDatabaseContext(tx, { parentDeliveryWorker: true });
    return work(tx);
  });
}

/** Service context used only by the isolated malware-scanner dispatch worker. */
export async function withDocumentWorkerContext<T>(prisma: PrismaClient, work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async tx => {
    await setDatabaseContext(tx, { documentScanWorker: true });
    return work(tx);
  });
}

/** Dedicated notification worker context. Database policies grant this flag access only to
 * notification outbox and the minimum guardian/consent records needed for delivery checks. */
export async function withNotificationWorkerContext<T>(prisma: PrismaClient, work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async tx => {
    await setDatabaseContext(tx, { notificationWorker: true });
    return work(tx);
  });
}

/** Public verification is read-only and narrowly policy-scoped to report-card verification data. */
export async function withReportCardVerificationContext<T>(prisma: PrismaClient, work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async tx => {
    await setDatabaseContext(tx, { reportCardVerification: true });
    return work(tx);
  });
}
