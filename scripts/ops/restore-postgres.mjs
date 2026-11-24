import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { chmod, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

async function value(name) {
  const direct = process.env[name];
  if (direct) return direct.trim();
  const file = process.env[`${name}_FILE`];
  if (file) return (await readFile(file, "utf8")).trim();
  return "";
}
function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.once("error", reject);
    child.once("exit", code => code === 0 ? resolve(undefined) : reject(new Error(`${command} exited with code ${code}`)));
  });
}
async function sha256(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}
function connectionParts(raw) {
  const url = new URL(raw);
  return { host: url.hostname.replace(/^\[|\]$/g, ""), port: url.port || "5432", user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), database: decodeURIComponent(url.pathname.replace(/^\//, "")), sslmode: url.searchParams.get("sslmode") || undefined };
}

const backupFile = process.argv[2] ? path.resolve(process.argv[2]) : "";
const databaseUrl = await value("DATABASE_URL");
const identity = process.env.AGE_IDENTITY_FILE;
if (!backupFile || !databaseUrl || !identity || process.env.ALLOW_DESTRUCTIVE_RESTORE !== "YES") {
  throw new Error("Usage: ALLOW_DESTRUCTIVE_RESTORE=YES DATABASE_URL=... AGE_IDENTITY_FILE=/path/to/identity node scripts/ops/restore-postgres.mjs <backup.dump.age>");
}
const info = await stat(backupFile);
if (!info.isFile()) throw new Error("Backup file is not a regular file.");
const sidecar = await readFile(`${backupFile}.sha256`, "utf8");
const expected = sidecar.trim().split(/\s+/)[0];
const actual = await sha256(backupFile);
if (!/^[a-f0-9]{64}$/i.test(expected) || expected !== actual) throw new Error("Backup SHA-256 verification failed.");
const tempDir = await mkdtemp(path.join(tmpdir(), "school-saas-restore-"));
const dumpFile = path.join(tempDir, "restore.dump");
const db = connectionParts(databaseUrl);
try {
  await run("age", ["--decrypt", "--identity", identity, "--output", dumpFile, backupFile]);
  await chmod(dumpFile, 0o600);
  const childEnv = { ...process.env, PGPASSWORD: db.password };
  if (db.sslmode) childEnv.PGSSLMODE = db.sslmode;
  console.error(`Restoring ${path.basename(backupFile)} to database ${db.database} on ${db.host}. Existing objects may be dropped.`);
  await run("pg_restore", ["--clean", "--if-exists", "--no-owner", "--no-acl", "--exit-on-error", "--single-transaction", "--host", db.host, "--port", db.port, "--username", db.user, "--dbname", db.database, dumpFile], { env: childEnv });
  console.log(JSON.stringify({ status: "restore-completed", backup: path.basename(backupFile), database: db.database, sha256: actual }));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
