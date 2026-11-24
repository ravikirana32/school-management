import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const checks = [];
const pass = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail });
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const canonical = [
  'SCHOOL-SaaS-FEATURE-CATALOG.md',
  'SCHOOL-SaaS-ROADMAP.md',
  'MISSED-FUNCTIONALITY-BACKLOG.md',
  'SCHOOL-SaaS-FEATURE-GAPS.md',
];
pass('four canonical consolidated documents exist', canonical.every(exists));
pass('README links canonical documents and Docker quick start', ['SCHOOL-SaaS-FEATURE-CATALOG.md','SCHOOL-SaaS-ROADMAP.md','MISSED-FUNCTIONALITY-BACKLOG.md','SCHOOL-SaaS-FEATURE-GAPS.md','DOCKER-LOCAL-QUICKSTART.md'].every(x => read('README.md').includes(x)));

const gapText = read('SCHOOL-SaaS-FEATURE-GAPS.md');
const gapRows = gapText.split(/\r?\n/).filter(x => /^- \[ \]/.test(x));
const p580Rows = gapRows.filter(x => /\bP580-G\d{3}\b/.test(x));
pass('all 737 P579+P580 open gap rows present', gapRows.length === 737, `rows=${gapRows.length}`);
pass('all eight P580 gaps present', p580Rows.length === 8, `P580 rows=${p580Rows.length}`);
pass('all eight P580 gap IDs unique', new Set(p580Rows.map(x => x.match(/P580-G\d{3}/)?.[0])).size === 8);

const compose = read('docker-compose.local.yml');
const services = ['postgres','redis','migrate','api','school-admin','organization-admin','super-admin','public-portal',
  'worker-parent-delivery','worker-document-scan','worker-notification-delivery','worker-admission-reservation-expiry',
  'worker-admissions-notification-reconciliation','worker-teacher-task-notifications','worker-reminder-policy-audit-export','worker-hostel-leave-monitor',
  'parent-mobile','teacher-mobile','student-mobile','staff-mobile','driver-mobile'];
pass('local Compose declares all 21 application/infrastructure services', services.every(x => new RegExp(`^  ${x}:`, 'm').test(compose)), `expected=${services.length}`);
pass('local Compose contains worker and mobile profiles', compose.includes('profiles: [workers]') && compose.includes('profiles: [mobile]'));
pass('migration gates API startup', /migrate:\s*\{condition: service_completed_successfully\}/.test(compose));
pass('API liveness healthcheck uses implemented endpoint', compose.includes('/health/live'));
pass('web apps receive correct API base variants', compose.includes('VITE_API_V1_BASE_URL') && compose.includes('VITE_API_BASE_URL'));
pass('all local app ports are loopback-bound', ['5173','5174','5175','5176','8080','5432','6379'].every(p => compose.includes(`127.0.0.1:${p}:`)));

const localDockerfile = read('Dockerfile.local');
const apiDockerfile = read('Dockerfile.api');
const webDockerfile = read('Dockerfile.web');
pass('local Dockerfile uses non-frozen install only for developer bootstrap', localDockerfile.includes('--no-frozen-lockfile') && !localDockerfile.includes('--frozen-lockfile'));
pass('production Dockerfiles retain frozen-lockfile gate', apiDockerfile.includes('--frozen-lockfile') && webDockerfile.includes('--frozen-lockfile'));
const envExample = read('.env.docker.example');
pass('local environment template has separate DB/Redis container hosts', envExample.includes('@postgres:5432/') && envExample.includes('redis://redis:6379'));
pass('local environment secrets explicitly marked local-only', envExample.includes('local-only'));
pass('Docker quick-start warns local profile is not production', read('DOCKER-LOCAL-QUICKSTART.md').includes('not production deployment'));

const mirrorGroups = [
  ['MASTER-OPEN-GAPS-REGISTER.md','docs/MASTER-OPEN-GAPS-REGISTER.md','docs/phases/MASTER-OPEN-GAPS-REGISTER.md','docs/phases/P500/MASTER-OPEN-GAPS-REGISTER.md','docs/phases/P501/MASTER-OPEN-GAPS-REGISTER.md'],
  ['MASTER-ACTIVE-GAPS-REGISTER.md','docs/MASTER-ACTIVE-GAPS-REGISTER.md','docs/phases/MASTER-ACTIVE-GAPS-REGISTER.md'],
  ['FINAL-DETAILS-ALL-FEATURES.md','docs/FINAL-DETAILS-ALL-FEATURES.md','docs/phases/FINAL-DETAILS-ALL-FEATURES.md'],
  ['IMPLEMENTATION-STATUS.md','docs/IMPLEMENTATION-STATUS.md','docs/phases/IMPLEMENTATION-STATUS.md'],
  ['MASTER-CYCLE-COVERAGE-CHECKLIST.md','docs/MASTER-CYCLE-COVERAGE-CHECKLIST.md','docs/phases/MASTER-CYCLE-COVERAGE-CHECKLIST.md'],
  ['MASTER-RESOLVED-GAPS-HISTORY.md','docs/MASTER-RESOLVED-GAPS-HISTORY.md','docs/phases/MASTER-RESOLVED-GAPS-HISTORY.md'],
];
pass('legacy compatibility mirrors remain byte-identical', mirrorGroups.every(group => group.every(exists) && group.every(x => read(x) === read(group[0]))));
pass('canonical gap document is mirrored to legacy root path', read('MASTER-OPEN-GAPS-REGISTER.md') === read('SCHOOL-SaaS-FEATURE-GAPS.md'));
pass('canonical feature catalogue is mirrored to legacy root path', read('FINAL-DETAILS-ALL-FEATURES.md') === read('SCHOOL-SaaS-FEATURE-CATALOG.md'));
pass('C2-11 roadmap/progress compatibility mirrors remain synchronized', ['C2-11-ROADMAP.md','C2-11-PROGRESS.md'].every(name => ['docs/'+name,'docs/phases/'+name].every(mirror => exists(mirror) && read(mirror) === read(name))));

const result = { phase: 'P580', passed: checks.filter(x => x.ok).length, total: checks.length, checks };
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
console.log(`\nP580 ${result.passed}/${result.total} checks passed`);
if (process.env.P580_JSON_OUT) fs.writeFileSync(process.env.P580_JSON_OUT, JSON.stringify(result, null, 2) + '\n');
if (result.passed !== result.total) process.exitCode = 1;
