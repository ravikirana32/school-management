import { readdirSync, readFileSync } from "node:fs";
import { resolve, extname } from "node:path";
import { createRequire } from "node:module";
const root = process.cwd();
const require = createRequire(import.meta.url);
let ts;
try {
  const explicit = process.env.TYPESCRIPT_PATH;
  ts = require(explicit || "typescript");
} catch {
  console.error("TypeScript parser unavailable. Install workspace dependencies first (pnpm install --frozen-lockfile).");
  process.exit(2);
}
const roots = ["backend", "apps", "packages"];
const sourceFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "dist", "build", ".expo"].includes(entry.name)) continue;
      walk(path);
    } else if ([".ts", ".tsx", ".mts"].includes(extname(path))) sourceFiles.push(path);
  }
}
for (const dir of roots) walk(resolve(root, dir));
let failures = 0;
for (const file of sourceFiles) {
  const source = readFileSync(file, "utf8");
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  for (const diagnostic of parsed.parseDiagnostics) {
    failures++;
    const position = parsed.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, " ");
    console.error(`${file}:${position.line + 1}:${position.character + 1} TS${diagnostic.code} ${message}`);
  }
}
console.log(`TypeScript syntax: ${sourceFiles.length} files scanned; ${failures} parse errors.`);
if (failures) process.exit(1);
