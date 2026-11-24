import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const seed = fs.readFileSync(path.join(root, 'backend/api/prisma/seed.ts'), 'utf8');
const routes = fs.readFileSync(path.join(root, 'backend/api/src/modules/parents/parent.routes.ts'), 'utf8');
const docs = fs.readFileSync(path.join(root, 'docs/security/P125-FINANCIAL-AUTHORIZATION.md'), 'utf8');
const gaps = fs.readFileSync(path.join(root, 'MASTER-OPEN-GAPS-REGISTER.md'), 'utf8');
const docsGaps = fs.readFileSync(path.join(root, 'docs/MASTER-OPEN-GAPS-REGISTER.md'), 'utf8');
const history = fs.readFileSync(path.join(root, 'MASTER-RESOLVED-GAPS-HISTORY.md'), 'utf8');
const docsHistory = fs.readFileSync(path.join(root, 'docs/MASTER-RESOLVED-GAPS-HISTORY.md'), 'utf8');
const checks = [
  ['payment read permission is seeded', seed.includes('["fees.payments.read","fees.payments","read"]')],
  ['payment record permission is seeded', seed.includes('["fees.payments.record","fees.payments","record"]')],
  ['SCHOOL_FINANCE role is seeded', seed.includes('{key:"SCHOOL_FINANCE",name:"Finance Officer"')],
  ['finance role has payment read and record permissions', /SCHOOL_FINANCE[^\n]*fees\.payments\.read[^\n]*fees\.payments\.record/.test(seed)],
  ['finance role does not receive fee-charge management', !/SCHOOL_FINANCE[^\n]*fees\.manage/.test(seed)],
  ['manual payment route requires fees.payments.record', /parentRouter\.post\(base\+'\/fees\/:chargeId\/payments',[\s\S]*?scope\(req,res,'fees\.payments\.record'\)/.test(routes)],
  ['fee list separately evaluates payment-detail permission', routes.includes('hasSchoolPermission(s.userId,s.organizationId,s.schoolId,"fees.payments.read")')],
  ['payment relation is conditionally selected', routes.includes('if(canReadPaymentDetails)chargeSelect.payments=')],
  ['fee list advertises payment-detail inclusion state', routes.includes('paymentDetailsIncluded:canReadPaymentDetails')],
  ['fee list remains protected by fees.read', routes.includes('const s=await scope(req,res,"fees.read"); if(!s)return;')],
  ['parent fee statement remains consent-bound', routes.includes("parentScope(userId,organizationId,schoolId,'parent.fees.read')") && routes.includes('parentStudentLink(tx,userId,organizationId,schoolId,req.params.studentId)')],
  ['fee charge creation retains fees.manage', routes.includes("parentRouter.post(base+'/children/:studentId/fees',authenticate,wrap(async(req,res)=>{const s=await scope(req,res,'fees.manage')")],
  ['fee charge publication retains fees.manage', (/parentRouter\.patch\(base\+'\/fees\/:chargeId\/publish',authenticate,wrap\(async\(req,res\)=>\{\s*const s=await scope\(req,res,'fees\.manage'\)/.test(routes))],
  ['manual payment audit and duplicate/overpayment protections remain', routes.includes("action:'student.fee.payment.recorded'") && routes.includes("result.kind==='DUPLICATE'") && routes.includes("result.kind==='OVERPAYMENT'")],
  ['documentation explicitly records refund and ledger limitations', docs.includes('Refunds, partial refunds, payment reversals') && docs.includes('balanced accounting journal posting')],
  ['P125 gaps are present', ['P125-G001','P125-G002','P125-G003'].every(id => gaps.includes(id))],
  ['root and docs gap registers are identical', gaps === docsGaps],
  ['root and docs resolved histories are identical', history === docsHistory],
];
let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
console.log(`P125 verification: ${checks.length}/${checks.length} checks passed`);
