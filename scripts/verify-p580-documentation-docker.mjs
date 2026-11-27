import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const checks = [];
const pass = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail });
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const canonical = [
  'SCHOOL-MANAGEMENT-SAAS-MASTER-FUNCTIONALITY-ROADMAP.md',
  'SCHOOL-SaaS-FEATURE-CATALOG.md',
  'SCHOOL-SaaS-ROADMAP.md',
  'MISSED-FUNCTIONALITY-BACKLOG.md',
  'SCHOOL-SaaS-FEATURE-GAPS.md',
  'DOCKER-LOCAL-QUICKSTART.md',
  'DEMO-DATA-TEST-RUNBOOK.md',
];
pass('master roadmap and supporting canonical documents exist', canonical.every(exists));
pass('README links current master roadmap', read('README.md').includes('SCHOOL-MANAGEMENT-SAAS-MASTER-FUNCTIONALITY-ROADMAP.md'));
pass('consolidated documentation links current master roadmap', read('SCHOOL-MANAGEMENT-SAAS-CONSOLIDATED-DOCUMENTATION.md').includes('SCHOOL-MANAGEMENT-SAAS-MASTER-FUNCTIONALITY-ROADMAP.md'));

const gapText = read('SCHOOL-SaaS-FEATURE-GAPS.md');
const gapRows = gapText.split(/\r?\n/).filter(x => /^- \[ \]/.test(x));
const p580Rows = gapRows.filter(x => /\bP580-G\d{3}\b/.test(x));
const p581Rows = read('docs/MASTER-OPEN-GAPS-REGISTER.md').split(/\r?\n/).filter(x => /^\|\s*P581-G\d{3}\s*\|/.test(x));
pass('all 737 P579+P580 open gap rows present', gapRows.length === 737, `rows=${gapRows.length}`);
pass('all eight P580 gaps present', p580Rows.length === 8, `P580 rows=${p580Rows.length}`);
pass('all eight P580 gap IDs unique', new Set(p580Rows.map(x => x.match(/P580-G\d{3}/)?.[0])).size === 8);
pass('P581 demo acceptance gaps are retained separately', p581Rows.length === 8, `P581 rows=${p581Rows.length}`);

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
pass('all local app ports are loopback-bound', [
  '127.0.0.1:${POSTGRES_HOST_PORT:-15432}:5432',
  '127.0.0.1:${REDIS_HOST_PORT:-16379}:6379',
  '127.0.0.1:${API_HOST_PORT:-18080}:8080',
  '127.0.0.1:${SCHOOL_ADMIN_HOST_PORT:-15173}:5173',
  '127.0.0.1:${ORGANIZATION_ADMIN_HOST_PORT:-15174}:5174',
  '127.0.0.1:${SUPER_ADMIN_HOST_PORT:-15175}:5175',
  '127.0.0.1:${PUBLIC_PORTAL_HOST_PORT:-15176}:5176',
].every(p => compose.includes(p)));

const localDockerfile = read('Dockerfile.local');
const apiDockerfile = read('Dockerfile.api');
const webDockerfile = read('Dockerfile.web');
pass('local Dockerfile uses non-frozen install only for developer bootstrap', localDockerfile.includes('--no-frozen-lockfile') && !localDockerfile.includes('--frozen-lockfile'));
pass('production Dockerfiles retain frozen-lockfile gate', apiDockerfile.includes('--frozen-lockfile') && webDockerfile.includes('--frozen-lockfile'));
const envExample = read('.env.docker.example');
pass('local environment template has separate DB/Redis container hosts', envExample.includes('@postgres:5432/') && envExample.includes('redis://redis:6379'));
pass('local environment secrets explicitly marked local-only', envExample.includes('local-only'));
pass('Docker quick-start warns local profile is not production', read('DOCKER-LOCAL-QUICKSTART.md').includes('not production deployment'));

pass('feature catalogue historical archive remains byte-identical', read('docs/FINAL-DETAILS-ALL-FEATURES.md') === read('SCHOOL-SaaS-FEATURE-CATALOG.md'));
pass('master gap and status registers remain under docs', [
  'docs/MASTER-OPEN-GAPS-REGISTER.md',
  'docs/MASTER-ACTIVE-GAPS-REGISTER.md',
  'docs/MASTER-RESOLVED-GAPS-HISTORY.md',
  'docs/MASTER-CYCLE-COVERAGE-CHECKLIST.md',
  'docs/IMPLEMENTATION-STATUS.md',
].every(exists));
pass('P579 release status and C2-11 records remain available', [
  'docs/phases/P579/P579-STATUS.md',
  'docs/C2-11-ROADMAP.md',
  'docs/C2-11-PROGRESS.md',
].every(exists));

const result = { phase: 'P580', passed: checks.filter(x => x.ok).length, total: checks.length, checks };
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
console.log(`\nP580 ${result.passed}/${result.total} checks passed`);
if (process.env.P580_JSON_OUT) fs.writeFileSync(process.env.P580_JSON_OUT, JSON.stringify(result, null, 2) + '\n');
if (result.passed !== result.total) process.exitCode = 1;
