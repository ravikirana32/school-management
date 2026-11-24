import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js';

const root = 'backend/api/src';
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.generated'].includes(entry.name)) walk(file);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(file);
  }
}
walk(root);
const syntaxErrors = [];
const missingImports = [];
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
function resolves(base) {
  if (fs.existsSync(base) || extensions.some(ext => fs.existsSync(base + ext)) || extensions.some(ext => fs.existsSync(path.join(base, `index${ext}`)))) return true;
  if (base.endsWith('.js')) return ['.ts', '.tsx'].some(ext => fs.existsSync(base.slice(0, -3) + ext));
  if (base.endsWith('.jsx')) return fs.existsSync(base.slice(0, -4) + '.tsx');
  return false;
}
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : file.endsWith('.jsx') ? ts.ScriptKind.JSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, kind);
  for (const diagnostic of source.parseDiagnostics) {
    const position = source.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    syntaxErrors.push(`${file}:${position.line + 1}:${position.character + 1} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const specifier = node.moduleSpecifier;
      if (specifier && ts.isStringLiteral(specifier) && specifier.text.startsWith('.')) {
        const base = path.resolve(path.dirname(file), specifier.text);
        if (!resolves(base)) missingImports.push(`${file} -> ${specifier.text}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
const apiPackage = JSON.parse(fs.readFileSync('backend/api/package.json', 'utf8'));
const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const checks = [
  ['Backend source tree exists and is populated', files.length >= 150],
  ['Backend TypeScript/JavaScript parser audit ran', files.length > 0],
  ['All backend source parses without syntax errors', syntaxErrors.length === 0],
  ['All relative backend imports resolve to source or index files', missingImports.length === 0],
  ['Auth integration test imports API app from correct src-relative path', fs.readFileSync('backend/api/src/modules/auth/auth.integration.test.ts', 'utf8').includes('../../app.js')],
  ['Auth validation integration test imports API app from correct src-relative path', fs.readFileSync('backend/api/src/modules/auth/auth.validation.integration.test.ts', 'utf8').includes('../../app.js')],
  ['Backend API package build script is TypeScript project compilation', apiPackage.scripts.build === 'tsc -p tsconfig.json'],
  ['Backend API typecheck script is present', apiPackage.scripts.typecheck === 'tsc --noEmit'],
  ['Backend NodeNext module and resolution settings are configured', (() => { const cfg = JSON.parse(fs.readFileSync('backend/api/tsconfig.json', 'utf8')); return cfg.compilerOptions.module === 'NodeNext' && cfg.compilerOptions.moduleResolution === 'NodeNext'; })()],
  ['P504 verifier is registered in root scripts', rootPackage.scripts['verify:p504'] === 'node scripts/verify-p504-backend-build-stabilization.mjs'],
  ['P504 report and mirrored gap register are present', fs.existsSync('docs/phases/P504/P504-DELIVERY-REPORT.md') && fs.existsSync('docs/phases/P504/MASTER-OPEN-GAPS-REGISTER.md') && fs.existsSync('MASTER-OPEN-GAPS-REGISTER.md') && fs.existsSync('docs/MASTER-OPEN-GAPS-REGISTER.md')],
  ['Backend audit excludes generated/build folders', !files.some(file => /\/(node_modules|dist|build|\.generated)\//.test(file))],
];
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  assert.ok(passed, name);
}
if (syntaxErrors.length) console.error('Syntax errors:\n' + syntaxErrors.join('\n'));
if (missingImports.length) console.error('Unresolved imports:\n' + missingImports.join('\n'));
console.log(`P504 focused assertions: ${checks.length}/${checks.length} PASS`);
console.log(`Backend audit: ${files.length} files; syntax errors ${syntaxErrors.length}; unresolved relative imports ${missingImports.length}`);
