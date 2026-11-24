import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
const verifierDir = resolve(process.cwd(), "scripts");
const verifiers = readdirSync(verifierDir).filter((file) => /^verify-.*\.mjs$/.test(file)).sort();
let passed = 0;
const failures = [];
for (const file of verifiers) {
  const result = spawnSync(process.execPath, ["--experimental-strip-types", resolve(verifierDir, file)], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (result.status === 0) {
    passed++;
    console.log(`PASS ${file}`);
  } else {
    failures.push({ file, code: result.status, output: `${result.stdout || ""}${result.stderr || ""}`.trim() });
    console.error(`FAIL ${file} (exit ${result.status})`);
    const output = failures.at(-1).output;
    if (output) console.error(output.split("\n").slice(-8).join("\n"));
  }
}
console.log(`Static verifier suite: ${passed}/${verifiers.length} PASS; ${failures.length} FAIL.`);
if (failures.length) process.exit(1);
