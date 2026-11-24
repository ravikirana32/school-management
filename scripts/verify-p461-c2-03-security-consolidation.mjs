import fs from 'node:fs';
import path from 'node:path';
const root = fs.existsSync(path.resolve(process.cwd(),'backend/api')) ? process.cwd() : path.resolve(process.cwd(),'../..');
const rel = p => path.join(root,p);
const readJson = p => JSON.parse(fs.readFileSync(rel(p),'utf8'));
const p454=readJson('docs/phases/P454/C2-03-ROUTE-SECURITY-INVENTORY.json');
const p455=readJson('docs/phases/P455/C2-03-HANDLER-SECURITY-REVIEW.json');
const p456=readJson('docs/phases/P456/C2-03-ROUTE-MIDDLEWARE-ORDER.json');
const p457=readJson('docs/phases/P457-rbac-role-permission-inventory.json');
const p458=readJson('docs/phases/P458-session-refresh-security-audit.json');
const p459=readJson('docs/phases/P459-credential-lifecycle-recovery-audit.json');
const p460=readJson('docs/phases/P460-mfa-auth-enforcement-policy-inventory.json');
const inv=readJson('docs/phases/P461-c2-03-security-consolidation.json');
const checks=[
 ['P454 route inventory exists and has modules',Array.isArray(p454.routeModules)&&p454.routeModules.length>0],
 ['P455 handler review exists and includes endpoints',Array.isArray(p455.modules)&&p455.modules.length>0&&p455.totalEndpoints>0],
 ['P456 middleware/mount inventory exists',Array.isArray(p456.middleware)&&Array.isArray(p456.mounts)&&p456.mounts.length>0],
 ['P457 RBAC permission/role inventory exists',p457.permissionCount>0&&p457.roleCount>0],
 ['P458 session security evidence exists',p458.sourceChecks&&p458.checkCount>0],
 ['P459 recovery security evidence exists',Array.isArray(p459.observations)&&p459.observations.length>0],
 ['P460 MFA policy inventory exists',Array.isArray(p460.policyMatrix)&&p460.policyMatrix.length>0],
 ['P461 consolidation covers P454-P460',Object.keys(inv.sourceInventories||{}).join(',')==='P454,P455,P456,P457,P458,P459,P460'],
 ['Cross-phase acceptance checklist has explicit pending states',Array.isArray(inv.cycleAcceptanceChecklist)&&inv.cycleAcceptanceChecklist.length>=8&&inv.cycleAcceptanceChecklist.some(x=>x.status.includes('OPEN'))],
 ['Consolidation explicitly does not claim runtime validation',inv.runtimeValidation==='NOT_PERFORMED'&&inv.evidenceType==='cross-phase-static-consolidation'],
 ['All listed phase inventory files exist',Object.values(inv.sourceInventories).every(x=>fs.existsSync(rel(x.file)))],
 ['Consolidated remediation order is provided',Array.isArray(inv.recommendedRemediationOrder)&&inv.recommendedRemediationOrder.length>=5],
 ['C2-03 security acceptance limitations are documented',Array.isArray(inv.limitations)&&inv.limitations.length>=3],
 ['P461 phase documentation exists',fs.existsSync(rel('P461-DELIVERY-REPORT.md'))&&fs.existsSync(rel('P461-TEST-REPORT.md'))]
];
let passed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'}: ${label}`);if(ok)passed++;}
console.log(`P461 verifier: ${passed}/${checks.length} passed`);if(passed!==checks.length)process.exit(1);
