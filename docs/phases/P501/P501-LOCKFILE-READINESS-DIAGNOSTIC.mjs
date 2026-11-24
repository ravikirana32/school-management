import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const rootManifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const packageDirs = ['apps', 'backend', 'packages'];
const manifests = packageDirs.flatMap((dir) => {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(full, entry.name, 'package.json'))
    .filter((file) => fs.existsSync(file));
});
const packageMap = new Map();
const issues = [];
let dependencyCount = 0;
for (const file of manifests) {
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { issues.push(`Manifest parse error ${path.relative(root, file)}: ${error.message}`); continue; }
  if (!manifest.name) issues.push(`Missing package name: ${path.relative(root, file)}`);
  else if (packageMap.has(manifest.name)) issues.push(`Duplicate package name: ${manifest.name}`);
  else packageMap.set(manifest.name, file);
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const [name, version] of Object.entries(manifest[section] || {})) {
      dependencyCount++;
      if (typeof version !== 'string' || !version.trim()) issues.push(`Invalid dependency version ${name} in ${path.relative(root, file)}`);
    }
  }
}
const workspaceRefs = [];
for (const file of manifests) {
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const [name, version] of Object.entries(manifest[section] || {})) {
      if (version.startsWith('workspace:')) workspaceRefs.push({ file: path.relative(root, file), name, version });
      if (version.startsWith('workspace:') && !packageMap.has(name)) issues.push(`Workspace reference ${name} from ${path.relative(root, file)} has no matching package`);
    }
  }
}
const lockExists = fs.existsSync(path.join(root, 'pnpm-lock.yaml'));
const workspaceExists = fs.existsSync(path.join(root, 'pnpm-workspace.yaml'));
const packageManager = rootManifest.packageManager || '';
const pinned = packageManager === 'pnpm@9.15.0';
const nodeMajor = Number(process.versions.node.split('.')[0]);
const nodeRangeOkay = nodeMajor >= 22 && nodeMajor < 23;
const registry = spawnSync('npm', ['config', 'get', 'registry'], { encoding: 'utf8', timeout: 4000 });
const registryUrl = registry.status === 0 ? registry.stdout.trim() : null;
const pnpm = spawnSync('pnpm', ['--version'], { encoding: 'utf8', timeout: 3000 });
const pnpmAvailable = pnpm.status === 0 && pnpm.stdout.trim() === '9.15.0';
const summary = {
  phase: 'P501', nodeVersion: process.versions.node, nodeRangeOkay,
  packageManager, pinned, workspaceFilePresent: workspaceExists,
  packageManifestCount: manifests.length, packageCount: packageMap.size,
  dependencyDeclarationCount: dependencyCount, workspaceReferenceCount: workspaceRefs.length,
  unresolvedWorkspaceReferences: issues.filter((issue) => issue.includes('has no matching package')),
  manifestIssues: issues, lockfilePresent: lockExists,
  pnpmAvailableAndPinned: pnpmAvailable, configuredRegistry: registryUrl,
  readiness: issues.length === 0 && workspaceExists && pinned && nodeRangeOkay && lockExists && pnpmAvailable,
  lockfileGenerationNeeded: !lockExists,
  nextAction: !lockExists ? 'Provision pnpm 9.15.0 and generate pnpm-lock.yaml with registry access; then install using --frozen-lockfile.' : 'Run frozen install and build/typecheck checks.'
};
console.log(JSON.stringify(summary, null, 2));
if (issues.length) process.exitCode = 1;
