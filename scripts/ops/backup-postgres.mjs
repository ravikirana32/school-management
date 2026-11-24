import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { chmod, mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
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
  if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("DATABASE_URL must be a PostgreSQL URL");
  return {
    host: url.hostname.replace(/^\[|\]$/g, ""),
    port: url.port || "5432",
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    sslmode: url.searchParams.get("sslmode") || undefined,
  };
}

const databaseUrl = await value("DATABASE_URL");
const recipient = process.env.AGE_RECIPIENT?.trim();
const backupDir = path.resolve(process.env.BACKUP_DIR || "./backups");
const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS || 30);
if (!databaseUrl || !recipient || !Number.isInteger(retentionDays) || retentionDays < 1) {
  throw new Error("DATABASE_URL, AGE_RECIPIENT and a positive BACKUP_RETENTION_DAYS are required.");
}
const db = connectionParts(databaseUrl);
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const baseName = `school-saas-postgres-${stamp}.dump.age`;
const tempDir = await mkdtemp(path.join(tmpdir(), "school-saas-backup-"));
const dumpFile = path.join(tempDir, "database.dump");
const encryptedPartial = path.join(tempDir, baseName);
const finalFile = path.join(backupDir, baseName);
await mkdir(backupDir, { recursive: true, mode: 0o700 });
try {
  const childEnv = { ...process.env, PGPASSWORD: db.password };
  if (db.sslmode) childEnv.PGSSLMODE = db.sslmode;
  await run("pg_dump", ["--format=custom", "--compress=6", "--no-owner", "--no-acl", "--host", db.host, "--port", db.port, "--username", db.user, "--dbname", db.database, "--file", dumpFile], { env: childEnv });
  await run("age", ["--recipient", recipient, "--output", encryptedPartial, dumpFile]);
  const digest = await sha256(encryptedPartial);
  await rename(encryptedPartial, finalFile);
  await chmod(finalFile, 0o600);
  const manifest = {
    createdAt: new Date().toISOString(),
    databaseHost: db.host,
    databaseName: db.database,
    format: "pg_dump-custom",
    encryption: "age",
    sha256: digest,
    file: baseName,
    applicationRevision: process.env.APP_REVISION || null,
  };
  await writeFile(`${finalFile}.sha256`, `${digest}  ${baseName}\n`, { mode: 0o600 });
  await writeFile(`${finalFile}.manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
  const cutoff = Date.now() - retentionDays * 86400_000;
  const entries = await (await import("node:fs/promises")).readdir(backupDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !/^school-saas-postgres-.*\.dump\.age$/.test(entry.name) || entry.name === baseName) continue;
    const candidate = path.join(backupDir, entry.name);
    if ((await stat(candidate)).mtimeMs < cutoff) {
      await Promise.all([candidate, `${candidate}.sha256`, `${candidate}.manifest.json`].map(file => rm(file, { force: true })));
    }
  }
  console.log(JSON.stringify({ status: "backup-created", file: baseName, sha256: digest, retentionDays }));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
