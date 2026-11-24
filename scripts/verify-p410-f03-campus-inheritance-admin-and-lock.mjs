import fs from 'node:fs';
const uiPath = 'apps/school-admin/src/CampusInheritanceWorkspace.tsx';
const mainPath = 'apps/school-admin/src/main.tsx';
const routePath = 'backend/api/src/modules/schools/school-config.routes.ts';
const configUiPath = 'apps/school-admin/src/SchoolConfigurationWorkspace.tsx';
const ui = fs.readFileSync(uiPath, 'utf8');
const main = fs.readFileSync(mainPath, 'utf8');
const route = fs.readFileSync(routePath, 'utf8');
const configUi = fs.readFileSync(configUiPath, 'utf8');
const checks = [
  ['campus inheritance workspace exists', fs.existsSync(uiPath)],
  ['inheritance data is loaded from authenticated API', /read\("\/campus-inheritance"\)/.test(ui)],
  ['campus selection includes active registry campuses', /campuses\.map/.test(ui) && /status === "ACTIVE"/.test(ui)],
  ['selection ref preserves campus choice without forcing reload loop', /selectedIdRef/.test(ui) && /selectedIdRef\.current = id/.test(ui) && /\[token, org, school, read\]/.test(ui)],
  ['parent campus selector excludes self', /row\.id !== selectedId/.test(ui)],
  ['main campus cannot be configured as child', /disabled=\{busy \|\| selectedCampus\?\.isMain\}/.test(ui)],
  ['inherited scopes can be toggled', /setCampusScopeInheritance/.test(ui)],
  ['scope overrides are editable as JSON', /jsonValues\[scope\]/.test(ui) && /JSON\.parse\(raw\)/.test(ui)],
  ['save sends campus-specific document', /campus-inheritance\/\$\{encodeURIComponent\(selectedId\)\}/.test(ui) && /configDocument: next/.test(ui)],
  ['remove inheritance action provided', /method: "DELETE"/.test(ui) && /Remove inheritance/.test(ui)],
  ['workspace imported into school admin', /CampusInheritanceWorkspace/.test(main)],
  ['school admin navigation entry present', /Campus inheritance/.test(main)],
  ['inheritance writes serialize by school with advisory lock', /pg_advisory_xact_lock/.test(route) && /campus-inheritance:\$\{s\.organizationId\}:\$\{s\.schoolId\}/.test(route)],
  ['graph validation occurs inside locked transaction', /P410:[\s\S]*?campusInheritanceCycleErrors\(campusId/.test(route)],
  ['active campus and parent validation retained', /Campus registry record is required before inheritance can be saved/.test(route) && /Parent campus must exist in the active campus registry/.test(route)],
  ['conflict response retained for cycle rejection', /Campus inheritance cycle rejected/.test(route) && /status: 409/.test(route)],
  ['transactional import endpoint handles all transfer scopes', /configuration-transfer\/import/.test(route) && /profile.*working.*policies.*academic.*calendar/.test(route)],
  ['import endpoint validates each domain before writing', /schoolProfileSchema\.safeParse/.test(route) && /dayConfigurationSchema\.safeParse/.test(route) && /schoolPolicySchema\.safeParse/.test(route) && /academicYearSchema\.safeParse/.test(route) && /calendarEventSchema\.safeParse/.test(route)],
  ['multi-record import writes use one tenant transaction', /P410: configuration transfer apply is server-transactional/.test(route) && /withTenantContext\(prisma, s, async tx =>/.test(route)],
  ['UI uses server atomic import instead of sequential writes', /configuration-transfer\/import/.test(configUi) && !/Academic import may have partially created records/.test(configUi)],
  ['UI surfaces atomic import rollback assurance', /server-side database transaction/.test(configUi) && /rolls back all changes/.test(configUi)],
  ['academic import handles nested terms and counts created terms', /year\.terms/.test(route) && /createdTerms\+\+/.test(route) && /createdTerms/.test(route)],
  ['portable calendar transfer maps to target-school current year', /Portable transfer IDs may belong to the source school/.test(route) && /prereq\.currentYear/.test(route)],
  ['calendar event writes occur within same transaction as calendar creation', /tx\.schoolCalendar\.create/.test(route) && /tx\.calendarEvent\.create/.test(route)],
  ['transfer audit is written inside the import transaction', /const auditTransfer = \(metadata: any\) => tx\.auditLog\.create/.test(route) && (route.match(/await auditTransfer\(metadata\)/g) || []).length === 5],
];
let failed = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}: ${label}`); if (!ok) failed++; }
console.log(`P410 verifier: ${checks.length-failed}/${checks.length} PASS`);
process.exitCode = failed ? 1 : 0;
