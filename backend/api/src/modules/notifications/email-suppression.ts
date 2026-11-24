import { createHmac } from "node:crypto";

export function normalizeEmailAddress(email: string): string { return email.trim().normalize("NFKC").toLowerCase(); }
export function hashSuppressionEmail(email: string, secret: string): string {
  if (secret.length < 32) throw new Error("Suppression hash secret must contain at least 32 characters");
  const normalized = normalizeEmailAddress(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error("Invalid email address");
  return createHmac("sha256", secret).update(normalized).digest("hex");
}

export type SuppressionHashKey = { version: string; secret: string };
/** Current-first lookup set. Keep the previous key until no active rows use its version. */
export function getSuppressionHashKeys(config: {
  currentSecret?: string; currentVersion: string; previousSecret?: string; previousVersion?: string;
  legacySecret?: string;
}): SuppressionHashKey[] {
  const currentSecret = config.currentSecret || config.legacySecret;
  if (!currentSecret) throw new Error("Suppression hash secret is not configured");
  const keys: SuppressionHashKey[] = [{ version: config.currentVersion, secret: currentSecret }];
  if (config.previousSecret && !config.previousVersion) throw new Error("Previous suppression key version is required");
  if (config.previousVersion && !config.previousSecret) throw new Error("Previous suppression key secret is required");
  if (config.previousSecret && config.previousVersion) {
    if (config.previousVersion === config.currentVersion) throw new Error("Current and previous suppression key versions must differ");
    keys.push({ version: config.previousVersion, secret: config.previousSecret });
  }
  return keys;
}
