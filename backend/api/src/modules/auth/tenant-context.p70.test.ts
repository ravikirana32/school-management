import { describe, expect, it, vi } from 'vitest';
import type { Prisma, PrismaClient } from '@prisma/client';
import {
  withDocumentWorkerContext,
  withIdentityContext,
  withNotificationWorkerContext,
  withParentWorkerContext,
  withPlatformContext,
  withReportCardVerificationContext,
  withTenantContext,
} from './tenant-context.js';

type RawCall = { query: TemplateStringsArray; values: unknown[] };
function prismaHarness() {
  const calls: RawCall[] = [];
  const tx = {
    $executeRaw: vi.fn(async (query: TemplateStringsArray, ...values: unknown[]) => {
      calls.push({ query, values });
      return 1;
    }),
  } as unknown as Prisma.TransactionClient;
  const prisma = {
    $transaction: vi.fn(async (work: (transaction: Prisma.TransactionClient) => Promise<unknown>) => work(tx)),
  } as unknown as PrismaClient;
  return { prisma, tx, calls };
}

const flagNames = [
  'app.is_platform_admin',
  'app.parent_delivery_worker',
  'app.document_scan_worker',
  'app.notification_worker',
  'app.report_card_verification',
];
function settingValues(calls: RawCall[]) {
  return calls.map(call => { const sql = call.query.join(''); return { sql, value: call.values[0] ?? sql.match(/,\s*'([^']*)',\s*true\)/)?.[1] }; });
}
function expectAllPrivilegedFlagsReset(calls: RawCall[], enabledFlag?: string) {
  const settings = settingValues(calls);
  for (const flag of flagNames) {
    const writes = settings.filter(setting => setting.sql.includes(flag));
    expect(writes.length).toBeGreaterThan(0);
    expect(writes.at(-1)?.value).toBe(flag === enabledFlag ? 'true' : 'false');
  }
  expect(settings.every(setting => setting.sql.includes('set_config') && setting.sql.includes(', true)'))).toBe(true);
}

describe('P575 transaction-local tenant context isolation', () => {
  it('requires an organization before opening a transaction', async () => {
    const { prisma } = prismaHarness();
    await expect(withTenantContext(prisma, { organizationId: '' }, async () => 'unreachable')).rejects.toThrow(
      'Organization scope is required',
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('requires a user identity before opening an identity transaction', async () => {
    const { prisma } = prismaHarness();
    await expect(withIdentityContext(prisma, '', async () => 'unreachable')).rejects.toThrow('User identity is required');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('sets tenant selectors and clears every privileged worker/platform flag', async () => {
    const { prisma, tx, calls } = prismaHarness();
    const result = await withTenantContext(prisma, { organizationId: 'org-a', schoolId: 'school-a', userId: 'user-a' }, async scopedTx => {
      expect(scopedTx).toBe(tx);
      return 'ok';
    });
    expect(result).toBe('ok');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    const settings = settingValues(calls);
    expect(settings.some(setting => setting.sql.includes('app.current_organization_id') && setting.value === 'org-a')).toBe(true);
    expect(settings.some(setting => setting.sql.includes('app.current_school_id') && setting.value === 'school-a')).toBe(true);
    expect(settings.some(setting => setting.sql.includes('app.current_user_id') && setting.value === 'user-a')).toBe(true);
    expectAllPrivilegedFlagsReset(calls);
  });

  it('uses identity-only context and clears tenant and privileged selectors', async () => {
    const { prisma, calls } = prismaHarness();
    await withIdentityContext(prisma, 'user-a', async () => undefined);
    const settings = settingValues(calls);
    expect(settings.some(setting => setting.sql.includes('app.current_user_id') && setting.value === 'user-a')).toBe(true);
    expectAllPrivilegedFlagsReset(calls);
    expect(settings.some(setting => setting.sql.includes('app.current_organization_id') && setting.value === '')).toBe(true);
    expect(settings.some(setting => setting.sql.includes('app.current_school_id') && setting.value === '')).toBe(true);
  });

  it.each([
    ['platform', withPlatformContext, 'app.is_platform_admin'],
    ['parent worker', withParentWorkerContext, 'app.parent_delivery_worker'],
    ['document worker', withDocumentWorkerContext, 'app.document_scan_worker'],
    ['notification worker', withNotificationWorkerContext, 'app.notification_worker'],
    ['public report verification', withReportCardVerificationContext, 'app.report_card_verification'],
  ])('opens an isolated %s context with all unrelated privilege flags disabled', async (_label, helper, enabledFlag) => {
    const { prisma, calls } = prismaHarness();
    await helper(prisma, async () => undefined);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expectAllPrivilegedFlagsReset(calls, enabledFlag);
  });
});
