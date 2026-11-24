import { describe, expect, it, vi } from "vitest";
import type { Prisma, PrismaClient } from "@prisma/client";
import { withIdentityContext, withTenantContext } from "./tenant-context.js";

type ConfigCall = { sql: string; values: unknown[] };
function scopedHarness() {
  const configCalls: ConfigCall[] = [];
  const tx = {
    $executeRaw: vi.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
      configCalls.push({ sql: strings.join("?"), values });
      return 1;
    }),
  } as unknown as Prisma.TransactionClient;
  const prisma = {
    $transaction: vi.fn(async (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) => callback(tx)),
  } as unknown as PrismaClient;
  return { prisma, tx, configCalls };
}

describe("P468 tenant and school scope integration contract", () => {
  it("rejects missing organization scope before transaction begins", async () => {
    const { prisma } = scopedHarness();
    await expect(withTenantContext(prisma, { organizationId: "" }, async () => "nope")).rejects.toThrow("Organization scope is required");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("sets organization, school and user scope in the same transaction before work", async () => {
    const { prisma, tx, configCalls } = scopedHarness();
    const result = await withTenantContext(prisma, { organizationId: "org-alpha", schoolId: "school-alpha", userId: "teacher-alpha" }, async scopedTx => {
      expect(scopedTx).toBe(tx);
      expect(configCalls).toHaveLength(4);
      return "scoped-work";
    });
    expect(result).toBe("scoped-work");
    expect(configCalls.map(c => c.values)).toEqual([["org-alpha"], ["school-alpha"], ["teacher-alpha"], ["false"]]);
    expect(configCalls.every(c => c.sql.includes("set_config") && c.sql.includes(", true)"))).toBe(true);
  });

  it("clears school and organization identifiers for identity-only membership access", async () => {
    const { prisma, configCalls } = scopedHarness();
    await withIdentityContext(prisma, "user-identity", async () => undefined);
    expect(configCalls.map(c => c.values)).toEqual([[""], [""], ["user-identity"], ["false"]]);
    expect(configCalls.every(c => c.sql.includes("set_config") && c.sql.includes(", true)"))).toBe(true);
  });

  it("keeps work callback inside the scoped transaction callback", async () => {
    const { prisma, tx } = scopedHarness();
    const callback = vi.fn(async (scopedTx: Prisma.TransactionClient) => scopedTx === tx);
    await withTenantContext(prisma, { organizationId: "org-beta", schoolId: "school-beta", userId: "parent-beta" }, callback);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(tx);
  });

  it("does not elevate tenant requests to platform-admin context", async () => {
    const { prisma, configCalls } = scopedHarness();
    await withTenantContext(prisma, { organizationId: "org-gamma", schoolId: "school-gamma" }, async () => undefined);
    expect(configCalls[3].values).toEqual(["false"]);
  });

  it("uses empty school context when organization-scoped work omits school", async () => {
    const { prisma, configCalls } = scopedHarness();
    await withTenantContext(prisma, { organizationId: "org-delta", userId: "staff-delta" }, async () => undefined);
    expect(configCalls.map(c => c.values)).toEqual([["org-delta"], [""], ["staff-delta"], ["false"]]);
  });
});
