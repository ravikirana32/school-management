import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const root=process.cwd();const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const schema=read("backend/api/prisma/schema.prisma");const migration=read("backend/api/prisma/migrations/20261118110000_p127_accounting_ledger/migration.sql");const service=read("backend/api/src/modules/billing/school-accounting-ledger.ts");const routes=read("backend/api/src/modules/parents/parent.routes.ts");const seed=read("backend/api/prisma/seed.ts");const gaps=read("MASTER-OPEN-GAPS-REGISTER.md");
const checks=[
["account model",schema.includes("model AccountingAccount {")],
["period model",schema.includes("model AccountingPeriod {")],
["journal entry and line models",schema.includes("model AccountingJournalEntry {")&&schema.includes("model AccountingJournalLine {")],
["default chart includes receivable, clearing and revenue",["1100","1110","4000"].every(x=>service.includes(x))],
["integer minor-unit balancing",service.includes("toMinorUnits")&&service.includes("debitTotal !== creditTotal")],
["source idempotency and transaction lock",service.includes("sourceType: args.sourceType, sourceId: args.sourceId")&&service.includes("pg_advisory_xact_lock")&&service.includes("accounting-period:${period.id}")],
["fee charge publication posts journal",routes.includes("postFeeCharge(tx")],
["payment recording posts journal",routes.includes("postFeePayment(tx")],
["refund settlement posts journal",routes.includes("postFeeRefundSettlement(tx")],
["accounting initialization/read APIs",routes.includes("/accounting/initialize")&&routes.includes("/accounting/accounts")],
["journal and trial-balance APIs",routes.includes("/accounting/journals")&&routes.includes("/accounting/trial-balance")],
["period listing and close control",routes.includes("/accounting/periods")&&routes.includes("accounting.periods.manage")&&routes.includes("accounting-period:${period.id}")],
["seeded permissions",["accounting.read","accounting.post","accounting.periods.manage"].every(x=>seed.includes(x))],
["Finance Officer can post but cannot close period",/key:"SCHOOL_FINANCE"[^\n]*accounting.read[^\n]*accounting.post/.test(seed)&&!/key:"SCHOOL_FINANCE"[^\n]*accounting.periods.manage/.test(seed)],
["forced tenant RLS on all ledger tables",migration.includes("FORCE ROW LEVEL SECURITY")&&["AccountingAccount","AccountingPeriod","AccountingJournalEntry","AccountingJournalLine"].every(x=>migration.includes(x))],
["journal immutability triggers",migration.includes("AccountingJournalEntry_immutable")&&migration.includes("AccountingJournalLine_immutable")],
["deferred database balance validation",migration.includes("DEFERRABLE INITIALLY DEFERRED")&&migration.includes("debit_total <> credit_total")],
["closed-period posting guard",migration.includes("AccountingJournalEntry_open_period")&&migration.includes("period_status IS DISTINCT FROM 'OPEN'")],
["P127 gaps recorded",["P127-G001","P127-G002","P127-G003"].every(x=>gaps.includes(x))],
["gap register mirror",gaps===read("docs/MASTER-OPEN-GAPS-REGISTER.md")],
["resolved history mirror",read("MASTER-RESOLVED-GAPS-HISTORY.md")===read("docs/MASTER-RESOLVED-GAPS-HISTORY.md")],
];for(const [name,ok] of checks){console.log(`${ok?"PASS":"FAIL"} ${name}`);assert.ok(ok,name);}console.log(`P127 static verifier: ${checks.length}/${checks.length} PASS`);
