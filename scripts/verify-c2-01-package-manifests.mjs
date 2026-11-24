import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceDirs = ['apps', 'backend', 'packages'];
const manifests = [];
const errors = [];
for (const group of workspaceDirs) {
  const groupPath = path.join(root, group);
  if (!fs.existsSync(groupPath)) continue;
  for (const name of fs.readdirSync(groupPath)) {
    const manifestPath = path.join(groupPath, name, 'package.json');
    if (!fs.existsSync(manifestPath)) continue;
    try {
      const pkg = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      manifests.push({ dir: path.relative(root, path.dirname(manifestPath)), pkg });
    } catch (e) { errors.push(`Invalid JSON: ${manifestPath}: ${e.message}`); }
  }
}
const names = new Map();
for (const { dir, pkg } of manifests) {
  if (!pkg.name) errors.push(`Missing package name: ${dir}`);
  if (pkg.name && names.has(pkg.name)) errors.push(`Duplicate package name: ${pkg.name} (${names.get(pkg.name)}, ${dir})`);
  else if (pkg.name) names.set(pkg.name, dir);
}
for (const { dir, pkg } of manifests) {
  for (const [depName, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies })) {
    if (typeof version !== 'string' || !version.trim()) errors.push(`Invalid dependency version: ${dir}/${depName}`);
    if (version === 'workspace:*' || version.startsWith('workspace:')) {
      const target = names.get(depName);
      if (!target) errors.push(`Workspace dependency unresolved: ${dir} -> ${depName} (${version})`);
    }
  }
  for (const [scriptName, command] of Object.entries(pkg.scripts ?? {})) {
    if (typeof command !== 'string' || !command.trim()) errors.push(`Empty script: ${dir}/${scriptName}`);
    for (const match of command.matchAll(/(?:node|tsx|ts-node)\s+((?:\.\.?\/)?scripts?\/[^\s;&|]+)/g)) {
      const target = path.resolve(root, dir, match[1]);
      if (!fs.existsSync(target)) errors.push(`Script target missing: ${dir}/${scriptName} -> ${match[1]}`);
    }
  }
}
console.log(`Workspace packages inspected: ${manifests.length}`);
console.log(`Unique package names: ${names.size}`);
console.log(`Manifest dependency/script errors: ${errors.length}`);
for (const e of errors) console.error(`FAIL ${e}`);
if (errors.length) process.exitCode = 1;
else console.log('PASS package manifests, names, dependency declarations and script targets are consistent');
