import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const apps = ['parent-mobile', 'student-mobile', 'teacher-mobile', 'staff-mobile'];
const results = [];
const parsed = {};
for (const app of apps) {
  const base = path.join('apps', app);
  const pkgPath = path.join(base, 'package.json');
  const appConfigPath = path.join(base, 'app.json');
  const tsConfigPath = path.join(base, 'tsconfig.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  parsed[app] = { pkg, appConfig, tsConfig };
  results.push([`${app}: package manifest parses`, true]);
  results.push([`${app}: Expo app config parses`, true]);
  results.push([`${app}: TypeScript config parses`, true]);
  results.push([`${app}: Expo start/build/typecheck scripts exist`, Boolean(pkg.scripts?.start && pkg.scripts?.build && pkg.scripts?.typecheck)]);
  results.push([`${app}: P505 verifier script registered`, pkg.scripts?.['verify:p505'] === 'node ../../scripts/verify-p505-mobile-build-stabilization.mjs']);
  results.push([`${app}: Expo config has name, slug, version, scheme`, Boolean(appConfig.expo?.name && appConfig.expo?.slug && appConfig.expo?.version && appConfig.expo?.scheme)]);
  results.push([`${app}: TypeScript config extends Expo base`, tsConfig.extends === 'expo/tsconfig.base']);
}
const expo = apps.map(a => parsed[a].pkg.dependencies?.expo);
const react = apps.map(a => parsed[a].pkg.dependencies?.react);
const rn = apps.map(a => parsed[a].pkg.dependencies?.['react-native']);
results.push(['Four mobile apps are present and audited', apps.length === 4]);
results.push(['Expo versions are consistently pinned across mobile apps', new Set(expo).size === 1 && expo.every(Boolean)]);
results.push(['React versions are consistently pinned across mobile apps', new Set(react).size === 1 && react.every(Boolean)]);
results.push(['React Native versions are consistently pinned across mobile apps', new Set(rn).size === 1 && rn.every(Boolean)]);
const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
results.push(['P505 verifier registered at root', rootPkg.scripts?.['verify:p505'] === 'node scripts/verify-p505-mobile-build-stabilization.mjs']);
const studentConfig = parsed['student-mobile'].tsConfig;
results.push(['Student app uses Expo TypeScript base (NodeNext root config mismatch remediated)', studentConfig.extends === 'expo/tsconfig.base']);
results.push(['Student app explicitly scopes its TypeScript sources', Array.isArray(studentConfig.include) && studentConfig.include.includes('App.tsx') && studentConfig.include.includes('src')]);
for (const [name, pass] of results) {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
  assert.ok(pass, name);
}
console.log(`P505 focused assertions: ${results.length}/${results.length} PASS`);
console.log(`Mobile apps audited: ${apps.join(', ')}`);
console.log(`Version matrix: Expo ${expo[0]}, React ${react[0]}, React Native ${rn[0]}`);
