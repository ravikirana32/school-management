import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const admissions = read("backend/api/src/modules/admissions/admission.routes.ts");
const access = read("backend/api/src/modules/access/access.routes.ts");
const organizations = read("backend/api/src/modules/organizations/organization.routes.ts");

assert.match(admissions, /import \{ hasSchoolPermission \} from "\.\.\/auth\/school-permissions\.js"/);
assert.match(admissions, /async function scope\(req:any,res:any,permission:"admissions\.read"\|"admissions\.manage"="admissions\.read"\)/);
assert.match(admissions, /hasActiveSchoolMembership\(userId,organizationId,schoolId\)/);
assert.match(admissions, /hasSchoolPermission\(userId,organizationId,schoolId,permission\)/);
const admissionReads = [...admissions.matchAll(/admissionRouter\.get\([^\n]*scope\(req,res,"admissions\.read"\)/g)].length;
const admissionWrites = [...admissions.matchAll(/admissionRouter\.post\([^\n]*scope\(req,res,"admissions\.manage"\)/g)].length;
assert.equal(admissionReads, 24, `Expected 24 admissions read routes; found ${admissionReads}`);
assert.equal(admissionWrites, 18, `Expected 18 admissions manage POST routes; found ${admissionWrites}`);
assert.doesNotMatch(admissions, /admissionRouter\.(?:get|post|put|patch|delete)\([^\n]*scope\(req,res\)/);

assert.match(access, /import \{ withIdentityContext, withTenantContext \} from "\.\.\/auth\/tenant-context\.js"/);
assert.match(access, /withIdentityContext\(prisma,s\.userId,tx=>tx\.user\.findMany/);
assert.equal((access.match(/withIdentityContext\(prisma,s\.userId,tx=>tx\.user\.findMany/g) || []).length, 2);
assert.match(organizations, /withIdentityContext\(prisma, userId, tx => tx\.organization\.findMany/);

const timetable = read("backend/api/src/modules/staff/teacher-timetable.routes.ts");
assert.match(timetable, /async function scope\(req:any,res:any\)/);
assert.match(timetable, /hasActiveSchoolMembership\(userId,organizationId,schoolId\)/);
assert.match(timetable, /async function canManageTimetable/);
assert.match(timetable, /hasSchoolPermission\(userId,organizationId,schoolId,"academics\.manage"\)/);

const gap = read("MASTER-OPEN-GAPS-REGISTER.md");
const docsGap = read("docs/MASTER-OPEN-GAPS-REGISTER.md");
assert.equal(gap, docsGap, "Root/docs master gap registers differ");
assert.match(gap, /P120-G001/);
assert.match(gap, /P120-G002/);
assert.match(gap, /P120-G003/);

console.log(JSON.stringify({
  admissionsReadRoutesPermissionScoped: admissionReads,
  admissionsWriteRoutesPermissionScoped: admissionWrites,
  accessUserLookupsUseIdentityContext: 2,
  organizationListingUsesIdentityContext: true,
  timetableMembershipAndManagementGuardsPresent: true,
  rootDocsGapRegisterParity: true,
  checks: 18
}, null, 2));
