import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const envPath = path.resolve(process.env.ENV_FILE || ".env.prod");
let envText;
try { envText = await readFile(envPath, "utf8"); }
catch { console.error(`Production environment validation failed: missing environment file ${envPath}. Copy .env.prod.example to .env.prod and configure values.`); process.exit(1); }
const env = Object.fromEntries(envText.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#") && line.includes("=")).map(line => {
  const index = line.indexOf("=");
  return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
}));
const errors = [];
const requiredEnv = ["NODE_ENV","API_HOST","API_PORT","CORS_ORIGINS","S3_BUCKET","S3_REGION","AGE_RECIPIENT","BACKUP_RETENTION_DAYS","API_HOSTNAME","SCHOOL_ADMIN_HOST","ORGANIZATION_ADMIN_HOST","SUPER_ADMIN_HOST","PUBLIC_PORTAL_HOST","VITE_API_BASE_URL","IMAGE_NAMESPACE","ALERT_WEBHOOK_URL","PARENT_PORTAL_BASE_URL","REPORT_CARD_VERIFY_BASE_URL"];
for (const key of requiredEnv) if (!env[key] || env[key].includes("example.com") || env[key].includes("replace-with") || env[key].includes("your-org")) errors.push(`Set a real value for ${key} in ${envPath}.`);
if (env.NODE_ENV !== "production") errors.push("NODE_ENV must be production.");
if (env.CORS_ORIGINS && (env.CORS_ORIGINS.includes("*") || /http:\/\/localhost/i.test(env.CORS_ORIGINS) || env.CORS_ORIGINS.split(",").some(origin => !origin.trim().startsWith("https://")))) errors.push("CORS_ORIGINS must contain explicit HTTPS origins only.");
if (env.AGE_RECIPIENT && !/^age1[0-9a-z]+$/.test(env.AGE_RECIPIENT)) errors.push("AGE_RECIPIENT does not look like an age public recipient.");
if (env.VITE_API_BASE_URL && !env.VITE_API_BASE_URL.startsWith("https://")) errors.push("VITE_API_BASE_URL must use HTTPS.");
if (env.ALERT_WEBHOOK_URL && !env.ALERT_WEBHOOK_URL.startsWith("https://")) errors.push("ALERT_WEBHOOK_URL must use HTTPS.");
if (env.PARENT_PORTAL_BASE_URL && !env.PARENT_PORTAL_BASE_URL.startsWith("https://")) errors.push("PARENT_PORTAL_BASE_URL must use HTTPS.");
if (env.REPORT_CARD_VERIFY_BASE_URL && !env.REPORT_CARD_VERIFY_BASE_URL.startsWith("https://")) errors.push("REPORT_CARD_VERIFY_BASE_URL must use HTTPS.");
try {
  const dbUrl = new URL((await readFile(path.resolve(env.SECRETS_DIR || "./secrets", "database_url"), "utf8")).trim());
  if (!["postgres:", "postgresql:"].includes(dbUrl.protocol) || !dbUrl.password) errors.push("database_url must be a PostgreSQL URL with a password.");
} catch { /* Missing file is reported in the required-file loop. */ }
try {
  const redisUrl = new URL((await readFile(path.resolve(env.SECRETS_DIR || "./secrets", "redis_url"), "utf8")).trim());
  if (redisUrl.protocol !== "redis:" || !redisUrl.password) errors.push("redis_url must be a Redis URL with authentication.");
} catch { /* Missing file is reported in the required-file loop. */ }
const secretsDir = path.resolve(env.SECRETS_DIR || "./secrets");
const requiredFiles = ["postgres_password","redis_password","database_url","redis_url","jwt_access_secret","jwt_refresh_secret","platform_secret_key","parent_invite_key","metrics_token","suppression_hash_current","grafana_admin_password","backup_age_identity.txt","backup_age_recipient.txt"];
for (const name of requiredFiles) {
  try {
    const file = path.join(secretsDir, name);
    const [content, info] = await Promise.all([readFile(file), stat(file)]);
    if (!content.toString("utf8").trim()) errors.push(`Secret file is empty: ${name}`);
    if ((info.mode & 0o077) !== 0) errors.push(`Secret file permissions must be 0600 or stricter: ${name}`);
    if (["jwt_access_secret","jwt_refresh_secret","platform_secret_key","metrics_token","suppression_hash_current","postgres_password","redis_password","grafana_admin_password"].includes(name) && content.toString("utf8").trim().length < 32) errors.push(`${name} must contain at least 32 characters.`);
    if (name === "parent_invite_key" && Buffer.from(content.toString("utf8").trim(), "base64").length !== 32) errors.push("parent_invite_key must be a base64-encoded 32-byte key.");
    if (name === "backup_age_identity.txt" && !content.toString("utf8").includes("AGE-SECRET-KEY-1")) errors.push("backup_age_identity.txt is not an age identity.");
    if (name === "backup_age_recipient.txt" && !content.toString("utf8").trim().startsWith("age1")) errors.push("backup_age_recipient.txt is not an age recipient.");
  } catch { errors.push(`Missing required secret file: ${name}`); }
}
try {
  const recipient = (await readFile(path.join(secretsDir, "backup_age_recipient.txt"), "utf8")).trim();
  if (env.AGE_RECIPIENT && recipient !== env.AGE_RECIPIENT) errors.push("AGE_RECIPIENT does not match backup_age_recipient.txt.");
} catch { /* already reported */ }
for (const cert of [path.resolve(env.TLS_CERT_DIR || "./certs", "fullchain.pem"), path.resolve(env.TLS_CERT_DIR || "./certs", "privkey.pem")]) {
  try { if ((await stat(cert)).size === 0) errors.push(`TLS certificate file is empty: ${cert}`); }
  catch { errors.push(`Missing TLS certificate file: ${cert}`); }
}
if (errors.length) {
  console.error("Production environment validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Production environment and required secret-file checks: PASS (values redacted).");
