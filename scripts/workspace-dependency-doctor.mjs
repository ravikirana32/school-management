import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const manifests = ['apps', 'backend', 'packages'].flatMap((dir) => {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(full, entry.name, 'package.json'))
    .filter((file) => fs.existsSync(file));
});
const names = new Set();
const duplicateNames = [];
const manifestErrors = [];
for (const file of manifests) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data.name) manifestErrors.push(`${path.relative(root, file)}: missing name`);
    if (data.name && names.has(data.name)) duplicateNames.push(data.name);
    if (data.name) names.add(data.name);
  } catch (error) {
    manifestErrors.push(`${path.relative(root, file)}: ${error.message}`);
  }
}
const lockFiles = ['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock'].filter((f) => fs.existsSync(path.join(root, f)));
const pmPin = pkg.packageManager || '';
const expectedPnpm = /^pnpm@9\.15\.0$/;
const command = (name) => {
  const result = spawnSync(name, ['--version'], { encoding: 'utf8', timeout: 3000 });
  return result.status === 0 ? result.stdout.trim() : null;
};
const result = {
  node: command('node'), npm: command('npm'), pnpm: command('pnpm'), corepack: command('corepack'),
  packageManager: pmPin, packageManagerPinValid: expectedPnpm.test(pmPin),
  workspaceFile: fs.existsSync(path.join(root, 'pnpm-workspace.yaml')),
  manifestCount: manifests.length, uniqueWorkspaceNames: names.size,
  duplicateWorkspaceNames: duplicateNames, manifestErrors,
  lockFiles, lockfilePresent: lockFiles.includes('pnpm-lock.yaml'),
  installReady: Boolean(command('pnpm') && expectedPnpm.test(pmPin) && fs.existsSync(path.join(root, 'pnpm-lock.yaml')) && manifestErrors.length === 0 && duplicateNames.length === 0)
};
console.log(JSON.stringify(result, null, 2));
if (manifestErrors.length || duplicateNames.length || !result.packageManagerPinValid || !result.workspaceFile) process.exitCode = 1;
