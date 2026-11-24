import * as SecureStore from "expo-secure-store";

const PREFIX = "school.parent.notification-intent.v1";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1000;
export type PendingPreferenceIntent = { category: string; channel: string; enabled: boolean; savedAt: number };
function accountScope(email: string) {
  let hash = 2166136261;
  for (const char of email.trim().toLowerCase()) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16);
}
function storageKey(email: string, organizationId: string, schoolId: string) {
  return `${PREFIX}.${accountScope(email)}.${encodeURIComponent(organizationId)}.${encodeURIComponent(schoolId)}`;
}
export async function readPendingPreferenceIntents(email: string, organizationId: string, schoolId: string): Promise<PendingPreferenceIntent[]> {
  if (!email.trim() || !organizationId || !schoolId) return [];
  const key = storageKey(email, organizationId, schoolId);
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) { await SecureStore.deleteItemAsync(key); return []; }
    const valid = parsed.filter((item): item is PendingPreferenceIntent => item && typeof item.category === "string" && typeof item.channel === "string" && typeof item.enabled === "boolean" && Number.isFinite(item.savedAt) && Date.now() - item.savedAt <= TTL_MS && item.savedAt <= Date.now() + FUTURE_CLOCK_SKEW_MS);
    if (valid.length !== parsed.length) await SecureStore.setItemAsync(key, JSON.stringify(valid));
    return valid;
  } catch { await SecureStore.deleteItemAsync(key).catch(() => {}); return []; }
}
export async function writePendingPreferenceIntent(email: string, organizationId: string, schoolId: string, category: string, channel: string, enabled: boolean) {
  if (!email.trim() || !organizationId || !schoolId || !category || !channel) return;
  const existing = await readPendingPreferenceIntents(email, organizationId, schoolId);
  const next = existing.filter(item => !(item.category === category && item.channel === channel));
  next.push({ category, channel, enabled, savedAt: Date.now() });
  await SecureStore.setItemAsync(storageKey(email, organizationId, schoolId), JSON.stringify(next.slice(-100)));
}
export async function clearPendingPreferenceIntent(email: string, organizationId: string, schoolId: string, category: string, channel: string) {
  if (!email.trim() || !organizationId || !schoolId || !category || !channel) return;
  const existing = await readPendingPreferenceIntents(email, organizationId, schoolId);
  await SecureStore.setItemAsync(storageKey(email, organizationId, schoolId), JSON.stringify(existing.filter(item => !(item.category === category && item.channel === channel))));
}
