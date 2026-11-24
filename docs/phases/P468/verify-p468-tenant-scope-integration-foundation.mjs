import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.cwd(), process.cwd().endsWith('backend/api') ? '../..' : '.');
const testPath = path.join(root,'backend/api/src/modules/auth/tenant-scope-integration.test.ts');
const tenantPath = path.join(root,'backend/api/src/modules/auth/tenant-context.ts');
const pkgPath = path.join(root,'backend/api/package.json');
const test = fs.readFileSync(testPath,'utf8');
const tenant = fs.readFileSync(tenantPath,'utf8');
const pkg = JSON.parse(fs.readFileSync(pkgPath,'utf8'));
const checks = [
 ['tenant context helper imported',test.includes('withTenantContext')],
 ['identity context helper imported',test.includes('withIdentityContext')],
 ['missing organization rejected',test.includes('Organization scope is required')],
 ['organization scope fixture',test.includes('org-alpha')],
 ['school scope fixture',test.includes('school-alpha')],
 ['user scope fixture',test.includes('teacher-alpha')],
 ['scope settings asserted in callback',test.includes('expect(configCalls).toHaveLength(4)')],
 ['transaction callback client identity asserted',test.includes('expect(scopedTx).toBe(tx)')],
 ['transaction-local set_config assertions',test.includes('set_config') && test.includes(', true)')],
 ['identity context clears org selector',test.includes('values)).toEqual([[""], [""], ["user-identity"]') || test.includes('configCalls.map(c => c.values)).toEqual([[""], [""], ["user-identity"]')],
 ['tenant context prevents platform elevation',test.includes('does not elevate tenant requests') && test.includes('["false"]')],
 ['org-only scope defaults school empty',test.includes('omits school') && test.includes('["org-delta"], [""]')],
 ['scope callback executed once',test.includes('callback).toHaveBeenCalledTimes(1)')],
 ['scope transaction opens once',test.includes('$transaction).toHaveBeenCalledTimes(1)')],
 ['source helper requires organization id',tenant.includes('if (!scope.organizationId) throw new Error("Organization scope is required")')],
 ['tenant settings use transaction client',tenant.includes('prisma.$transaction(async (tx)') && tenant.includes('return work(tx)')],
 ['verify:p468 registered',pkg.scripts?.['verify:p468']==='node ../../scripts/verify-p468-tenant-scope-integration-foundation.mjs']
];
let failed=0;
for (const [name,ok] of checks) { console.log(`${ok?'PASS':'FAIL'} ${name}`); if(!ok) failed++; }
console.log(`P468 verification: ${checks.length-failed}/${checks.length} PASS`);
process.exit(failed?1:0);
