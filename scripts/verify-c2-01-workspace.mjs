import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
const root = process.cwd();
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const failures = [];
const passes = [];
function check(label, condition, blocker = false) {
  (condition ? passes : failures).push(`${condition ? "PASS" : blocker ? "BLOCKER" : "FAIL"} ${label}`);
}
const rootPkg = readJson("package.json");
check("root package manifest is valid JSON", true);
check("pnpm package manager is pinned to 9.15.0", rootPkg.packageManager === "pnpm@9.15.0");
check("Node runtime engine is declared (>=22 <23)", rootPkg.engines?.node === ">=22 <23");
check("pnpm engine is declared (9.15.0)", rootPkg.engines?.pnpm === "9.15.0");
check("workspace file exists", existsSync("pnpm-workspace.yaml"));
check("pnpm lockfile exists", existsSync("pnpm-lock.yaml"), true);
const expectedApps = ["super-admin", "organization-admin", "school-admin", "public-portal", "teacher-mobile", "parent-mobile", "student-mobile", "staff-mobile", "driver-mobile"];
const appPackages = [];
for (const app of expectedApps) {
  const pkgPath = `apps/${app}/package.json`;
  const appPkg = readJson(pkgPath);
  appPackages.push(appPkg);
  check(`${app} package manifest valid`, typeof appPkg.name === "string");
  check(`${app} has typecheck command`, Boolean(appPkg.scripts?.typecheck));
  check(`${app} source directory exists`, existsSync(`apps/${app}/src`));
  if (app.endsWith("mobile")) {
    const config = readJson(`apps/${app}/app.json`).expo;
    check(`${app} Expo app name/slug/scheme configured`, Boolean(config?.name && config?.slug && config?.scheme));
    check(`${app} has Expo start command`, Boolean(appPkg.scripts?.start));
    check(`${app} has Expo bundle build command`, appPkg.scripts?.build === "expo export");
  } else {
    check(`${app} has production build command`, Boolean(appPkg.scripts?.build));
  }
}
const api = readJson("backend/api/package.json");
check("API manifest valid", api.name === "@school-saas/api");
check("API has build/typecheck/test scripts", Boolean(api.scripts?.build && api.scripts?.typecheck && api.scripts?.test));
check("API Prisma generate/deploy scripts present", Boolean(api.scripts?.["prisma:generate"] && api.scripts?.["prisma:deploy"]));
const workspaceNames = [...appPackages.map(p => p.name), api.name, ...["shared-types", "api-client", "domain-rules", "validation"].map(n => readJson(`packages/${n}/package.json`).name)];
check("workspace package names are unique", new Set(workspaceNames).size === workspaceNames.length);
const tsconfigFiles = ["tsconfig.base.json", "backend/api/tsconfig.json", ...expectedApps.map(app => `apps/${app}/tsconfig.json`)];
for (const path of tsconfigFiles) check(`${path} exists and parses`, existsSync(path) && (()=>{try{JSON.parse(readFileSync(path,"utf8"));return true}catch{return false}})());
const mobileConfigs = expectedApps.filter(x=>x.endsWith("mobile"));
for (const app of mobileConfigs) check(`${app} app.json parses`, (()=>{try{readJson(`apps/${app}/app.json`);return true}catch{return false}})());
const parser = spawnSync(process.execPath, ["scripts/check-source-syntax.mjs"], { encoding: "utf8", env: { ...process.env, TYPESCRIPT_PATH: process.env.TYPESCRIPT_PATH || "" } });
check("TypeScript parser check available and passed", parser.status === 0, true);
if (parser.stdout) console.log(parser.stdout.trim());
if (parser.stderr) console.error(parser.stderr.trim());
for (const item of passes) console.log(item);
for (const item of failures) console.error(item);
console.log(`C2-01 workspace audit: ${passes.length} PASS; ${failures.length} FAIL/BLOCKER.`);
if (failures.length) process.exit(1);
