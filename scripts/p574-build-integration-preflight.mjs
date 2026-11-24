import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const packageDirs = ['apps', 'backend', 'packages'];
const packages = [];
for (const dir of packageDirs) {
  const absolute = path.join(root, dir);
  if (!fs.existsSync(absolute)) continue;
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(absolute, entry.name, 'package.json');
    if (!fs.existsSync(manifestPath)) continue;
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    packages.push({ name: manifest.name ?? `${dir}/${entry.name}`, path: path.relative(root, manifestPath) });
  }
}
const commandAvailable = (command) => {
  const result = spawnSync(command, ['--version'], { encoding: 'utf8', timeout: 3000, stdio: 'pipe' });
  return result.error ? null : (result.stdout || result.stderr || '').trim().split(/\r?\n/)[0];
};
const nodeMajor = Number(process.versions.node.split('.')[0]);
const checks = [
  { id: 'node-22', required: true, pass: nodeMajor === 22, detail: `Node ${process.versions.node}; required major 22` },
  { id: 'pnpm-lockfile', required: true, pass: fs.existsSync(path.join(root, 'pnpm-lock.yaml')), detail: fs.existsSync(path.join(root, 'pnpm-lock.yaml')) ? 'pnpm-lock.yaml exists' : 'pnpm-lock.yaml is absent; do not synthesize it' },
  { id: 'package-manager-pin', required: true, pass: packageJson.packageManager === 'pnpm@9.15.0', detail: `packageManager=${packageJson.packageManager ?? 'unset'}; required pnpm@9.15.0` },
  { id: 'pnpm-cli', required: true, pass: Boolean(commandAvailable('pnpm')), detail: commandAvailable('pnpm') ?? 'pnpm executable unavailable' },
  { id: 'docker-cli', required: true, pass: Boolean(commandAvailable('docker')), detail: commandAvailable('docker') ?? 'Docker CLI unavailable' },
  { id: 'postgres-client', required: true, pass: Boolean(commandAvailable('psql')), detail: commandAvailable('psql') ?? 'psql unavailable' },
  { id: 'prisma-cli', required: true, pass: Boolean(commandAvailable('prisma')), detail: commandAvailable('prisma') ?? 'Prisma CLI unavailable on PATH' },
  { id: 'workspace-packages', required: true, pass: packages.length === 14, detail: `${packages.length} package manifests discovered; expected 14` },
  { id: 'workspace-dependencies', required: true, pass: fs.existsSync(path.join(root, 'node_modules')), detail: fs.existsSync(path.join(root, 'node_modules')) ? 'root node_modules exists' : 'root node_modules absent' },
];
const report = {
  phase: 'P574',
  generatedAt: new Date().toISOString(),
  packageManager: packageJson.packageManager ?? null,
  packageCount: packages.length,
  packages,
  checks,
  passed: checks.filter((item) => item.pass).length,
  blocked: checks.filter((item) => !item.pass).length,
  ready: checks.every((item) => item.pass),
};
console.log(JSON.stringify(report, null, 2));
if (!report.ready) process.exitCode = 2;
