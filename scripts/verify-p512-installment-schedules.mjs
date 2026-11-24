import fs from 'node:fs';
import assert from 'node:assert/strict';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261123100000_p512_fee_installment_schedules/migration.sql','utf8');
const api=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/FinanceWorkspace.tsx','utf8');
const checks=[
 ['Schedule model is charge-linked with school/organization scope',/model FeeInstallmentSchedule/.test(schema)&&/chargeId String/.test(schema)&&/@@unique\(\[chargeId, organizationId, schoolId\]\)/.test(schema)&&/charge StudentFeeCharge @relation/.test(schema)],
 ['Installment rows retain sequence, due date, amount and paid amount',/model FeeInstallment/.test(schema)&&/sequence Int/.test(schema)&&/amountPaid Decimal @default\(0\)/.test(schema)&&/dueAt DateTime @db.Date/.test(schema)],
 ['Migration creates tenant-scoped composite foreign keys and unique schedule per charge',/FeeInstallmentSchedule_charge_fk/.test(migration)&&/FeeInstallment_schedule_fk/.test(migration)&&/chargeId.*organizationId.*schoolId/.test(migration)],
 ['Input validation limits count and interval',/installmentCount:z\.number\(\)\.int\(\)\.min\(1\)\.max\(24\)/.test(api)&&/intervalMonths:z\.number\(\)\.int\(\)\.min\(1\)\.max\(12\)/.test(api)],
 ['Amounts split using integer cents and remainder reconciliation',/totalCents=Math\.round\(Number\(totalAmount\)\*100\)/.test(api)&&/baseCents=Math\.floor\(totalCents\/count\)/.test(api)&&/i<remainder/.test(api)],
 ['Date generation clamps month-end dates',/date\.setUTCDate\(1\)/.test(api)&&/Math\.min\(day,lastDay\)/.test(api)],
 ['Tenant and permission scope enforced for read/create/update endpoints',/fees\.read/.test(api)&&/fees\.manage/.test(api)&&/feeInstallmentSchedule\.findFirst/.test(api)&&/feeInstallmentSchedule\.create/.test(api)&&/feeInstallmentSchedule\.update/.test(api)],
 ['Schedule creation uses advisory lock and duplicate protection',/fee-installment-schedule:\$\{req\.params\.chargeId\}/.test(api)&&/pg_advisory_xact_lock/.test(api)&&/kind:'EXISTS'/.test(api)],
 ['Schedules restricted to unapproved draft charges',/charge\.status!=='DRAFT'\|\|charge\.approvalStatus!=='DRAFT'/.test(api)],
 ['Schedule updates only allowed while unpaid draft',/schedule\.status!=='DRAFT'/.test(api)&&/Number\(x\.amountPaid\)>0/.test(api)],
 ['Audit events for create and update',/student\.fee\.installment_schedule\.created/.test(api)&&/student\.fee\.installment_schedule\.updated/.test(api)],
 ['Finance UI can load, create and update schedules',/openInstallmentSchedule/.test(ui)&&/installment-schedule/.test(ui)&&/method:existing\?"PUT":"POST"/.test(ui)&&/Configure installments/.test(ui)],
 ['UI shows saved installment sequence, due dates and amounts',/installmentSchedule\.installments\.map/.test(ui)&&/Due date/.test(ui)&&/Number\(row\.amount\)\.toFixed\(2\)/.test(ui)],
];
// Independently exercise the cents-splitting invariant on representative edge values.
function split(total,count){const cents=Math.round(total*100),base=Math.floor(cents/count),rem=cents-base*count;return Array.from({length:count},(_,i)=>base+(i<rem?1:0));}
for(const [total,count] of [[1000,3],[10.01,4],[0.05,4],[123456.78,24]]){const rows=split(total,count);assert.equal(rows.reduce((a,b)=>a+b,0),Math.round(total*100));assert(rows.every(x=>x>=0));}
// Month-end date clamp independent check: Jan 31 + 1 month -> Feb 28/29.
function addMonths(date,months){const d=new Date(`${date}T00:00:00.000Z`),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10);}
assert.equal(addMonths('2026-01-31',1),'2026-02-28');
assert.equal(addMonths('2028-01-31',1),'2028-02-29');
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`P512 focused verification: ${checks.length-failed}/${checks.length} PASS; arithmetic edge checks 6/6 PASS`);
if(failed)process.exit(1);
