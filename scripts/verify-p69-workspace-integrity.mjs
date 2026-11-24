import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const root = readJson('package.json');
const workspace = readFileSync('pnpm-workspace.yaml', 'utf8');
const requiredWorkspaceGlobs = ['apps/*', 'backend/*', 'packages/*'];
for (const glob of requiredWorkspaceGlobs) assert.ok(workspace.includes(glob), `Workspace glob missing: ${glob}`);

const packageFiles = [
  'backend/api/package.json',
  ...['organization-admin', 'parent-mobile', 'public-portal', 'school-admin', 'super-admin', 'teacher-mobile'].map((name) => `apps/${name}/package.json`),
  ...['api-client', 'shared-types', 'validation'].map((name) => `packages/${name}/package.json`),
];
const packages = packageFiles.map((path) => ({ path, manifest: readJson(path) }));
const names = new Set();
for (const { path, manifest } of packages) {
  assert.ok(manifest.name, `${path} has no package name`);
  assert.ok(!names.has(manifest.name), `Duplicate workspace package name: ${manifest.name}`);
  names.add(manifest.name);
  assert.ok(manifest.private === true, `${path} must remain private until publishing policy is defined`);
}

for (const script of ['build', 'lint', 'typecheck', 'test']) {
  assert.equal(typeof root.scripts[script], 'string', `Root ${script} script missing`);
}
assert.match(root.scripts.typecheck, /--if-present/, 'Root typecheck must not fail on intentionally script-less packages');
assert.ok(root.scripts['verify:p69'], 'P69 verifier script is not registered');
assert.ok(existsSync('.env.example'), 'Root environment template missing');
assert.ok(existsSync('docker-compose.yml'), 'Local infrastructure compose file missing');
assert.ok(existsSync('backend/api/prisma/schema.prisma'), 'Prisma schema missing');
assert.ok(existsSync('MASTER-OPEN-GAPS-REGISTER.md') && existsSync('docs/MASTER-OPEN-GAPS-REGISTER.md'));
assert.equal(readFileSync('MASTER-OPEN-GAPS-REGISTER.md', 'utf8'), readFileSync('docs/MASTER-OPEN-GAPS-REGISTER.md', 'utf8'), 'Gap register mirror mismatch');

const env = readFileSync('.env.example', 'utf8');
for (const key of ['DATABASE_URL', 'REDIS_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
  assert.match(env, new RegExp(`^${key}=`, 'm'), `Required env key missing: ${key}`);
}

const lockfiles = ['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock'].filter(existsSync);
const blockers = [];
if (!lockfiles.includes('pnpm-lock.yaml')) blockers.push('Pinned pnpm workspace has no pnpm-lock.yaml; reproducible frozen install is not possible.');
if (!existsSync('node_modules')) blockers.push('Dependencies are not installed in this workspace.');
if (!existsSync('eslint.config.js') && !existsSync('eslint.config.mjs') && !existsSync('.eslintrc.cjs') && !existsSync('.eslintrc.json')) {
  blockers.push('Lint scripts reference ESLint but no ESLint configuration is present.');
}

console.log(`P69 workspace integrity: ${packages.length}/${packages.length} workspace manifests valid; ${names.size} unique package names; root/docs gap registers identical.`);
if (blockers.length) {
  console.log(`P69 execution blockers (${blockers.length}):`);
  for (const blocker of blockers) console.log(`- BLOCKED: ${blocker}`);
} else {
  console.log('P69 workspace prerequisites: lockfile, dependencies and lint configuration present.');
}
