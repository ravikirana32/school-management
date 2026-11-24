import { randomUUID } from "node:crypto";

// All amounts are normalized to integer paise before balancing. The service is
// called inside the caller's tenant-scoped Prisma transaction.
const DEFAULT_ACCOUNTS = [
  { accountCode: "1100", name: "Accounts Receivable", accountType: "ASSET", normalBalance: "DEBIT" },
  { accountCode: "1110", name: "Cash / Bank Clearing", accountType: "ASSET", normalBalance: "DEBIT" },
  { accountCode: "4000", name: "School Fee Revenue", accountType: "REVENUE", normalBalance: "CREDIT" },
  { accountCode: "3000", name: "Opening Balance Equity", accountType: "EQUITY", normalBalance: "CREDIT" },
] as const;

function toMinorUnits(value: string | number): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("ACCOUNTING_INVALID_AMOUNT");
  const minor = Math.round(amount * 100);
  if (Math.abs(amount * 100 - minor) > 0.000001) throw new Error("ACCOUNTING_INVALID_PRECISION");
  return minor;
}
function fromMinorUnits(value: number): string { return (value / 100).toFixed(2); }
function monthBounds(date: Date) {
  const year = date.getUTCFullYear(); const month = date.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0));
  return { key: `${year}-${String(month + 1).padStart(2, "0")}`, start, end };
}

export async function ensureSchoolAccountingSetup(tx: any, scope: { organizationId: string; schoolId: string }, at = new Date()) {
  for (const account of DEFAULT_ACCOUNTS) {
    await tx.accountingAccount.upsert({
      where: { schoolId_accountCode: { schoolId: scope.schoolId, accountCode: account.accountCode } },
      update: {},
      create: { ...scope, ...account, isSystem: true, isActive: true },
    });
  }
  const bounds = monthBounds(at);
  const period = await tx.accountingPeriod.upsert({
    where: { schoolId_periodKey: { schoolId: scope.schoolId, periodKey: bounds.key } },
    update: {},
    create: { ...scope, periodKey: bounds.key, startsOn: bounds.start, endsOn: bounds.end, status: "OPEN" },
  });
  return { period };
}

export async function postSchoolJournal(tx: any, args: {
  organizationId: string; schoolId: string; actorUserId: string; sourceType: string; sourceId: string;
  postingDate: Date; currency: string; description: string;
  lines: Array<{ accountCode: string; debit?: string | number; credit?: string | number; memo?: string }>;
}) {
  const { organizationId, schoolId } = args;
  if (args.lines.length < 2) throw new Error("ACCOUNTING_JOURNAL_REQUIRES_TWO_LINES");
  const normalized = args.lines.map((line, index) => {
    const debit = line.debit == null || Number(line.debit) === 0 ? 0 : toMinorUnits(line.debit);
    const credit = line.credit == null || Number(line.credit) === 0 ? 0 : toMinorUnits(line.credit);
    if ((debit > 0) === (credit > 0)) throw new Error("ACCOUNTING_LINE_MUST_HAVE_ONE_SIDE");
    return { ...line, lineNumber: index + 1, debit, credit };
  });
  const debitTotal = normalized.reduce((sum, line) => sum + line.debit, 0);
  const creditTotal = normalized.reduce((sum, line) => sum + line.credit, 0);
  if (debitTotal <= 0 || debitTotal !== creditTotal) throw new Error("ACCOUNTING_JOURNAL_NOT_BALANCED");

  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", `${organizationId}:${schoolId}:journal:${args.sourceType}:${args.sourceId}`);
  const existing = await tx.accountingJournalEntry.findFirst({ where: { organizationId, schoolId, sourceType: args.sourceType, sourceId: args.sourceId }, include: { lines: true } });
  if (existing) return existing;

  const { period } = await ensureSchoolAccountingSetup(tx, { organizationId, schoolId }, args.postingDate);
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", `${organizationId}:${schoolId}:accounting-period:${period.id}`);
  const lockedPeriod = await tx.accountingPeriod.findFirst({ where: { id: period.id, organizationId, schoolId } });
  if (!lockedPeriod || lockedPeriod.status !== "OPEN") throw new Error("ACCOUNTING_PERIOD_CLOSED");
  const accounts = await tx.accountingAccount.findMany({
    where: { organizationId, schoolId, accountCode: { in: [...new Set(normalized.map(line => line.accountCode))] }, isActive: true },
  });
  const byCode = new Map(accounts.map((account: any) => [account.accountCode, account]));
  if (byCode.size !== new Set(normalized.map(line => line.accountCode)).size) throw new Error("ACCOUNTING_ACCOUNT_NOT_CONFIGURED");

  const entry = await tx.accountingJournalEntry.create({
    data: {
      organizationId, schoolId, periodId: lockedPeriod.id,
      entryNumber: `JE-${lockedPeriod.periodKey}-${randomUUID().slice(0, 8).toUpperCase()}`,
      sourceType: args.sourceType, sourceId: args.sourceId, postingDate: args.postingDate,
      currency: args.currency, description: args.description, status: "POSTED", createdBy: args.actorUserId,
      lines: { create: normalized.map(line => ({
        organizationId, schoolId, accountId: (byCode.get(line.accountCode) as any).id,
        lineNumber: line.lineNumber, debit: fromMinorUnits(line.debit), credit: fromMinorUnits(line.credit), memo: line.memo,
      })) },
    }, include: { lines: true },
  });
  await tx.auditLog.create({ data: {
    actorUserId: args.actorUserId, organizationId, schoolId, action: "accounting.journal.posted",
    resourceType: "AccountingJournalEntry", resourceId: entry.id, outcome: "SUCCESS",
    metadata: { entryNumber: entry.entryNumber, sourceType: args.sourceType, sourceId: args.sourceId, currency: args.currency, debitTotal: fromMinorUnits(debitTotal) },
  } });
  return entry;
}

export async function postFeeCharge(tx: any, args: { organizationId: string; schoolId: string; actorUserId: string; chargeId: string; amount: string | number; currency: string; postingDate: Date }) {
  const amount = toMinorUnits(args.amount);
  return postSchoolJournal(tx, { ...args, sourceType: "FEE_CHARGE", sourceId: args.chargeId, description: `Fee charge ${args.chargeId}`, lines: [
    { accountCode: "1100", debit: fromMinorUnits(amount), memo: "Student fee receivable" },
    { accountCode: "4000", credit: fromMinorUnits(amount), memo: "Recognized school fee revenue" },
  ] });
}
export async function postFeePayment(tx: any, args: { organizationId: string; schoolId: string; actorUserId: string; paymentId: string; amount: string | number; currency: string; postingDate: Date }) {
  const amount = toMinorUnits(args.amount);
  return postSchoolJournal(tx, { ...args, sourceType: "FEE_PAYMENT", sourceId: args.paymentId, description: `Fee payment ${args.paymentId}`, lines: [
    { accountCode: "1110", debit: fromMinorUnits(amount), memo: "Cash / bank clearing receipt" },
    { accountCode: "1100", credit: fromMinorUnits(amount), memo: "Reduce student fee receivable" },
  ] });
}
export async function postFeeRefundSettlement(tx: any, args: { organizationId: string; schoolId: string; actorUserId: string; refundId: string; amount: string | number; currency: string; postingDate: Date }) {
  const amount = toMinorUnits(args.amount);
  return postSchoolJournal(tx, { ...args, sourceType: "FEE_REFUND", sourceId: args.refundId, description: `Fee refund ${args.refundId}`, lines: [
    { accountCode: "1100", debit: fromMinorUnits(amount), memo: "Restore student fee receivable after refund" },
    { accountCode: "1110", credit: fromMinorUnits(amount), memo: "Cash / bank clearing refund" },
  ] });
}
