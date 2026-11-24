import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root='backend/api/src/modules';
const routeFiles=[];
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.routes.ts'))routeFiles.push(p)}}
walk(root);
const rows=routeFiles.map(file=>{const s=readFileSync(file,'utf8');const auth=s.includes('authenticate')||s.includes('auth.middleware');const permission=s.includes('hasSchoolPermission')||s.includes('hasPermission')||s.includes('hasSchoolAdminAccess')||s.includes('scope(')||s.includes('assertScope')||s.includes('requirePermission');const tenant=s.includes('withTenantContext')||s.includes('organizationId')&&s.includes('schoolId');return {file,auth,permission,tenant,bytes:s.length}});
const authCount=rows.filter(x=>x.auth).length, permissionCount=rows.filter(x=>x.permission).length, tenantCount=rows.filter(x=>x.tenant).length;
const auth=readFileSync('backend/api/src/modules/auth/permissions.ts','utf8');
const school=readFileSync('backend/api/src/modules/auth/school-permissions.ts','utf8');
const authMiddleware=readFileSync('backend/api/src/modules/auth/auth.middleware.ts','utf8');
const checks=[
 ['Permission helper defaults to deny absent permission',auth.includes('context.permissions.has(permission)')],
 ['Platform admin bypass explicitly modeled',auth.includes('context.isPlatformAdmin')],
 ['Wildcard grant is explicit and visible',auth.includes('context.permissions.has("*")')],
 ['Module wildcard grant is bounded to permission module',auth.includes('`${moduleName}.*`')],
 ['Organization mismatch scope rejection',auth.includes('Organization scope mismatch')],
 ['School mismatch scope rejection',auth.includes('School scope mismatch')],
 ['Missing school scope rejected',auth.includes('School scope is required')],
 ['School permission lookup requires active membership',school.includes('status:"ACTIVE"')||school.includes('status: "ACTIVE"')],
 ['Role assignments constrained to SCHOOL scope',school.includes('scopeType:"SCHOOL"')||school.includes('scopeType: "SCHOOL"')],
 ['Auth middleware only proceeds after token/session/user checks',authMiddleware.includes('verifyAccessToken')&&authMiddleware.includes('status: "ACTIVE"')&&authMiddleware.includes('return next()')],
 ['Protected route module inventory non-empty',rows.length>0],
 ['Route inventory includes authentication markers',authCount>0],
 ['Route inventory includes authorization/scope markers',permissionCount>0],
 ['Route inventory includes tenant/school context markers',tenantCount>0],
];
console.log('C2-03 RBAC/authorization static inventory');
console.log(`Route modules: ${rows.length}; auth markers: ${authCount}; authorization/scope markers: ${permissionCount}; tenant-context markers: ${tenantCount}`);
for(const r of rows)console.log(`${r.auth?'AUTH':'NO-AUTH-MARKER'} ${r.permission?'AUTHZ':'NO-AUTHZ-MARKER'} ${r.tenant?'TENANT':'NO-TENANT-MARKER'} ${r.file}`);
let passed=0;for(const [n,ok] of checks){if(ok){passed++;console.log(`PASS ${n}`)}else console.error(`FAIL ${n}`)}
console.log(`C2-03 RBAC/authorization source audit: ${passed}/${checks.length} PASS`);
console.log('Static heuristic inventory only. Middleware markers are not proof that every handler is protected; route-by-route authorization and tenant isolation require runtime negative tests.');
if(passed!==checks.length)process.exit(1);
