import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const uiPath = path.join(root, 'apps/school-admin/src/SchoolConfigurationWorkspace.tsx');
const ui = fs.readFileSync(uiPath, 'utf8');
const checks = [
  ['campus registry state is present', /campusRows/.test(ui) && /selectedCampusId/.test(ui)],
  ['registry fetched through authenticated school API', /read\("\/campus-registry"\)/.test(ui)],
  ['active campuses filtered for selector', /row\.status === "ACTIVE"/.test(ui)],
  ['effective configuration API called for selected campus', /campus-config\/effective\//.test(ui)],
  ['campus selection safely URL-encoded', /encodeURIComponent\(selectedCampusId\)/.test(ui)],
  ['read-only preview clearly stated', /read-only preview/.test(ui)],
  ['preview exposes inheritance chain', /campusEffectiveConfig\.chain/.test(ui)],
  ['preview renders resolved JSON', /JSON\.stringify\(campusEffectiveConfig/.test(ui)],
  ['loading feedback provided', /Loading effective campus configuration/.test(ui)],
  ['error feedback provided', /campusConfigError/.test(ui)],
  ['effect cancellation guard exists', /cancelled = false/.test(ui) && /cancelled\) return/.test(ui)],
];
let failed = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'}: ${label}`); if (!ok) failed++; }
console.log(`P409 verifier: ${checks.length-failed}/${checks.length} PASS`);
process.exitCode = failed ? 1 : 0;
