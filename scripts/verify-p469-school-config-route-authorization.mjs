import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.cwd(), process.cwd().endsWith('backend/api') ? '../..' : '.');
const routePath = path.join(root,'backend/api/src/modules/schools/school-config.routes.ts');
const testPath = path.join(root,'backend/api/src/modules/schools/school-config.authorization.integration.test.ts');
const packagePath = path.join(root,'backend/api/package.json');
const gapsPath = path.join(root,'MASTER-OPEN-GAPS-REGISTER.md');
const route = fs.readFileSync(routePath,'utf8'); const test = fs.readFileSync(testPath,'utf8'); const pkg = JSON.parse(fs.readFileSync(packagePath,'utf8')); const gaps=fs.readFileSync(gapsPath,'utf8');
const checks = [
 ['authorization integration test exists',fs.existsSync(testPath)],
 ['school-config router uses authentication middleware',route.includes('schoolConfigRouter.use(authenticate)')],
 ['route resolves authenticated user id',route.includes('const userId = req.auth!.userId')],
 ['membership gate present',route.includes('hasActiveSchoolMembership(userId, organizationId, schoolId)')],
 ['membership denial contract present',route.includes('Active school membership required')],
 ['permission gate present',route.includes('hasSchoolPermission(scopeValue.userId, scopeValue.organizationId, scopeValue.schoolId, permission)')],
 ['permission denial response includes permission name',route.includes('Missing required school permission: ${permission}')],
 ['protected campus registry GET route exists',route.includes('get("/:organizationId/:schoolId/campus-registry')],
 ['membership denial integration test',test.includes('membership is absent') && test.includes('mocks.tenant).not.toHaveBeenCalled()')],
 ['permission denial integration test',test.includes('school permission is absent')],
 ['authorized route integration test',test.includes('authorized read') && test.includes('status).toBe(200)')],
 ['organization/school/user scope asserted',test.includes('organizationId: "org-alpha", schoolId: "school-alpha", userId: "user-alpha"')],
 ['membership identifiers asserted',test.includes('toHaveBeenCalledWith("user-alpha", "org-alpha", "school-alpha")')],
 ['permission contract asserted',test.includes('"school.settings.manage"')],
 ['request route identifiers asserted',test.includes('org-beta/school-beta/campus-registry')],
 ['mock tenant transaction callback provided',test.includes('mocks.tenant.mockImplementation') && test.includes('work({ $queryRaw: mocks.queryRaw')],
 ['verify:p469 registered',pkg.scripts?.['verify:p469']==='node ../../scripts/verify-p469-school-config-route-authorization.mjs'],
 ['P469 gap register entry present',gaps.includes('P469-G001')]
];
let fail=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;} console.log(`P469 verification: ${checks.length-fail}/${checks.length} PASS`);process.exit(fail?1:0);
