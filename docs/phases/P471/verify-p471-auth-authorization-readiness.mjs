import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.cwd(), process.cwd().endsWith('backend/api') ? '../..' : '.');
const required = [
 ['P462 route inventory verifier', 'scripts/verify-p462-auth-runtime-verification-foundation.mjs'],
 ['P463 integration foundation verifier', 'scripts/verify-p463-auth-integration-test-foundation.mjs'],
 ['P464 negative-path verifier', 'scripts/verify-p464-auth-negative-path-validation.mjs'],
 ['P465 rate-limit verifier', 'scripts/verify-p465-auth-rate-limit-abuse-integration.mjs'],
 ['P466 authorization-boundary verifier', 'scripts/verify-p466-authorization-boundary-test-foundation.mjs'],
 ['P467 role-matrix verifier', 'scripts/verify-p467-authorization-role-matrix.mjs'],
 ['P468 tenant-scope verifier', 'scripts/verify-p468-tenant-scope-integration-foundation.mjs'],
 ['P469 protected-route verifier', 'scripts/verify-p469-school-config-route-authorization.mjs'],
 ['P470 error-contract verifier', 'scripts/verify-p470-auth-error-contracts.mjs'],
 ['P462 auth test source', 'backend/api/src/modules/auth/auth.integration.test.ts'],
 ['P463 auth integration test source', 'backend/api/src/modules/auth/auth.integration.test.ts'],
 ['P464 auth validation test source', 'backend/api/src/modules/auth/auth.validation.integration.test.ts'],
 ['P465 rate-limit test source', 'backend/api/src/modules/auth/auth-rate-limit.integration.test.ts'],
 ['P466 boundary test source', 'backend/api/src/modules/auth/authorization-boundary.integration.test.ts'],
 ['P467 role matrix test source', 'backend/api/src/modules/auth/authorization-role-matrix.integration.test.ts'],
 ['P468 tenant scope test source', 'backend/api/src/modules/auth/tenant-scope-integration.test.ts'],
 ['P469 route authorization test source', 'backend/api/src/modules/schools/school-config.authorization.integration.test.ts'],
 ['P470 error contract test source', 'backend/api/src/modules/auth/authorization-error-contract.integration.test.ts'],
 ['P471 readiness JSON inventory', 'docs/phases/P471-auth-authorization-acceptance-readiness.json'],
 ['P471 readiness document', 'docs/phases/P471-auth-authorization-acceptance-readiness.md'],
 ['P471 master gap section', 'MASTER-OPEN-GAPS-REGISTER.md']
];
let failed=0;
for (const [label, rel] of required) {
 const exists = fs.existsSync(path.join(root,rel));
 console.log(`${exists?'PASS':'FAIL'} ${label}`);
 if(!exists) failed++;
}
const json=JSON.parse(fs.readFileSync(path.join(root,'docs/phases/P471-auth-authorization-acceptance-readiness.json'),'utf8'));
for (const [label,ok] of [
 ['coverage matrix has 8 domains',json.domains.length===8],
 ['release gates defined',json.releaseGates.length>=8],
 ['runtime evidence correctly marked pending',json.runtimeEvidence.includes('Not provided')],
 ['all preceding phases represented',json.coverageSources.join(',')==='P462,P463,P464,P465,P466,P467,P468,P469,P470']
]) { console.log(`${ok?'PASS':'FAIL'} ${label}`); if(!ok)failed++; }
console.log(`P471 verifier: ${25-failed}/25 PASS`);
process.exit(failed?1:0);
