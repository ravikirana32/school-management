import { hashSuppressionEmail, type SuppressionHashKey } from "./email-suppression.js";

export type SuppressionHashAliasValue = { hashVersion: string; emailHash: string };
export type ActiveSuppressionHashAlias = SuppressionHashAliasValue & { status: string };

export function computeSuppressionHashAliases(email: string, keys: SuppressionHashKey[]): SuppressionHashAliasValue[] {
  return keys.map(key => ({ hashVersion: key.version, emailHash: hashSuppressionEmail(email, key.secret) }));
}

export function hasActiveSuppressionHashAlias(hashes: SuppressionHashAliasValue[], aliases: ActiveSuppressionHashAlias[]): boolean {
  const lookup = new Set(hashes.map(hash => `${hash.hashVersion}:${hash.emailHash}`));
  return aliases.some(alias => alias.status === "ACTIVE" && lookup.has(`${alias.hashVersion}:${alias.emailHash}`));
}
