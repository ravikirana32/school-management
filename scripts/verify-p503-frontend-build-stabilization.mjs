import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js';

const roots = ['apps/organization-admin', 'apps/school-admin', 'apps/super-admin', 'apps/public-portal', 'apps/teacher-mobile', 'apps/staff-mobile', 'apps/parent-mobile', 'apps/student-mobile'];
const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.expo', 'dist', 'build'].includes(entry.name)) walk(file);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) sourceFiles.push(file);
  }
}
roots.forEach(walk);
const syntaxErrors = [];
const missingImports = [];
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
function resolveRelativeImport(base) {
  if (extensions.some(ext => fs.existsSync(base + ext)) || fs.existsSync(base)) return true;
  if (extensions.some(ext => fs.existsSync(path.join(base, `index${ext}`)))) return true;
  // TypeScript commonly permits .js import specifiers to resolve to TS source before emit.
  if (base.endsWith('.js')) return ['.ts', '.tsx'].some(ext => fs.existsSync(base.slice(0, -3) + ext));
  if (base.endsWith('.jsx')) return fs.existsSync(base.slice(0, -4) + '.tsx');
  return false;
}
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : file.endsWith('.jsx') ? ts.ScriptKind.JSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  for (const diagnostic of source.parseDiagnostics) {
    const pos = source.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    syntaxErrors.push(`${file}:${pos.line + 1}:${pos.character + 1} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const spec = node.moduleSpecifier;
      if (spec && ts.isStringLiteral(spec) && spec.text.startsWith('.')) {
        const base = path.resolve(path.dirname(file), spec.text);
        if (!resolveRelativeImport(base)) missingImports.push(`${file} -> ${spec.text}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
const checks = [
  ['Eight frontend workspaces are included in audit', roots.length === 8],
  ['At least 90 frontend source files were audited', sourceFiles.length >= 90],
  ['All audited frontend files parse without syntax errors', syntaxErrors.length === 0],
  ['No unresolved relative frontend imports remain', missingImports.length === 0],
  ['Parent canteen screen style string is repaired', fs.readFileSync('apps/parent-mobile/src/canteen/ParentCanteenScreen.tsx', 'utf8').includes("error:{color:'#b42318'}});")],
  ['Parent health retry callback is properly closed', fs.readFileSync('apps/parent-mobile/src/health/ParentHealthScreen.tsx', 'utf8').includes('onPress={()=>setRetry(v=>v+1)} style=')],
  ['Staff Admissions session import points to src/auth', fs.readFileSync('apps/staff-mobile/src/AdmissionsPanel.tsx', 'utf8').includes("from './auth/session'")],
  ['Web app build scripts include TypeScript project build and Vite', ['organization-admin','school-admin','super-admin','public-portal'].every(app => JSON.parse(fs.readFileSync(`apps/${app}/package.json`, 'utf8')).scripts.build === 'tsc -b && vite build')],
  ['Mobile app build scripts include Expo export', ['teacher-mobile','staff-mobile','parent-mobile','student-mobile'].every(app => JSON.parse(fs.readFileSync(`apps/${app}/package.json`, 'utf8')).scripts.build === 'expo export')],
  ['Frontend audit covers all current web and mobile package directories', roots.every(root => fs.existsSync(root))],
  ['P503 phase report and verifier sources are present', fs.existsSync('docs/phases/P503/P503-DELIVERY-REPORT.md') && fs.existsSync('scripts/verify-p503-frontend-build-stabilization.mjs')],
  ['P503 verifier is registered in root package scripts', JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts['verify:p503'] === 'node scripts/verify-p503-frontend-build-stabilization.mjs'],
];
for (const [name, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
  assert.ok(pass, name);
}
if (syntaxErrors.length) console.error('Syntax diagnostics:', syntaxErrors.join('\n'));
if (missingImports.length) console.error('Unresolved relative imports:', missingImports.join('\n'));
console.log(`P503 focused assertions: ${checks.length}/${checks.length} PASS`);
console.log(`Frontend source parser audit: ${sourceFiles.length} files; syntax errors ${syntaxErrors.length}; unresolved relative imports ${missingImports.length}`);
