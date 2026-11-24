import * as SecureStore from 'expo-secure-store';

const PREFIX = 'school.parent.cache.v1';
const INDEX = `${PREFIX}.index`;
const ACCOUNT_PREFIX = "school.parent.account-cache.v1";
const TTL_MS = 6 * 60 * 60 * 1000;
const MAX_CHARS = 10_000;
type CacheRecord<T> = { savedAt: number; value: T };
function userScope(email: string) {
  // Namespace only, not an authentication primitive. SecureStore protects the cached bytes.
  let hashA = 2166136261;
  let hashB = 5381;
  for (const char of email.trim().toLowerCase()) {
    hashA = Math.imul(hashA ^ char.charCodeAt(0), 16777619);
    hashB = Math.imul(hashB, 33) ^ char.charCodeAt(0);
  }
  return `${(hashA >>> 0).toString(16)}${(hashB >>> 0).toString(16)}`;
}
function keyFor(email: string, organizationId: string, schoolId: string, studentId: string, kind: string) {
  return `${PREFIX}.${[userScope(email), organizationId, schoolId, studentId, kind].map(encodeURIComponent).join('.')}`;
}
async function readIndex(): Promise<string[]> {
  try {
    const value: unknown = JSON.parse((await SecureStore.getItemAsync(INDEX)) || '[]');
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
  } catch { return []; }
}

function accountCacheKey(email: string, kind: string) {
  return `${ACCOUNT_PREFIX}.${userScope(email)}.${encodeURIComponent(kind)}`;
}
function accountCacheIndexKey(email: string) {
  return `${ACCOUNT_PREFIX}.${userScope(email)}.index`;
}
export async function writeParentAccountCache<T>(email: string, kind: string, value: T) {
  if (!email.trim() || !kind) return;
  const key = accountCacheKey(email, kind);
  const serialized = JSON.stringify({ savedAt: Date.now(), value } satisfies CacheRecord<T>);
  if (serialized.length > MAX_CHARS) return;
  await SecureStore.setItemAsync(key, serialized);
  let index: string[] = [];
  try {
    const parsed: unknown = JSON.parse(await SecureStore.getItemAsync(accountCacheIndexKey(email)) || "[]");
    if (Array.isArray(parsed)) index = parsed.filter((item): item is string => typeof item === "string");
  } catch {}
  const next = [...new Set([...index, key])].slice(-100);
  await SecureStore.setItemAsync(accountCacheIndexKey(email), JSON.stringify(next));
}
export async function readParentAccountCache<T>(email: string, kind: string): Promise<T | null> {
  if (!email.trim() || !kind) return null;
  const key = accountCacheKey(email, kind);
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return null;
  try {
    const record = JSON.parse(raw) as CacheRecord<T>;
    if (!Number.isFinite(record.savedAt) || Date.now() - record.savedAt > 6 * 60 * 60 * 1000) {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
    return record.value;
  } catch {
    await SecureStore.deleteItemAsync(key);
    return null;
  }
}

export async function clearParentAccountCache(email: string, kind: string) {
  if (!email.trim() || !kind) return;
  const key = accountCacheKey(email, kind);
  await SecureStore.deleteItemAsync(key);
  const indexKey = accountCacheIndexKey(email);
  let index: string[] = [];
  try {
    const parsed: unknown = JSON.parse(await SecureStore.getItemAsync(indexKey) || "[]");
    if (Array.isArray(parsed)) index = parsed.filter((item): item is string => typeof item === "string");
  } catch {}
  await SecureStore.setItemAsync(indexKey, JSON.stringify(index.filter(item => item !== key)));
}

export async function writeParentCache<T>(email: string, organizationId: string, schoolId: string, studentId: string, kind: string, value: T) {
  if (!email.trim() || !organizationId || !schoolId || !studentId) return;
  const serialized = JSON.stringify({ savedAt: Date.now(), value } satisfies CacheRecord<T>);
  if (serialized.length > MAX_CHARS) return;
  const key = keyFor(email, organizationId, schoolId, studentId, kind);
  await SecureStore.setItemAsync(key, serialized);
  const index = await readIndex();
  const combined = [...index.filter(item => item !== key), key];
  const next = combined.slice(-80);
  const evicted = combined.filter(item => !next.includes(item));
  await Promise.all(evicted.map(item => SecureStore.deleteItemAsync(item)));
  await SecureStore.setItemAsync(INDEX, JSON.stringify(next));
}

export async function readParentCache<T>(email: string, organizationId: string, schoolId: string, studentId: string, kind: string): Promise<T | null> {
  if (!email.trim() || !organizationId || !schoolId || !studentId) return null;
  const key = keyFor(email, organizationId, schoolId, studentId, kind);
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return null;
  try {
    const record = JSON.parse(raw) as CacheRecord<T>;
    if (!Number.isFinite(record.savedAt) || Date.now() - record.savedAt > TTL_MS) {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
    return record.value;
  } catch {
    await SecureStore.deleteItemAsync(key);
    return null;
  }
}

export async function clearParentCache(email: string, organizationId?: string, schoolId?: string) {
  const scope = encodeURIComponent(userScope(email));
  const index = await readIndex();
  const retained: string[] = [];
  const remove: string[] = [];
  for (const key of index) {
    const parts = key.split('.');
    const belongsToUser = parts[4] === scope;
    const belongsToSchool = !organizationId || !schoolId || (parts[5] === encodeURIComponent(organizationId) && parts[6] === encodeURIComponent(schoolId));
    if (belongsToUser && belongsToSchool) remove.push(key);
    else retained.push(key);
  }
  await Promise.all(remove.map(key => SecureStore.deleteItemAsync(key)));
  await SecureStore.setItemAsync(INDEX, JSON.stringify(retained));
  if (!organizationId && !schoolId) {
    const accountIndexKey = accountCacheIndexKey(email);
    let accountKeys: string[] = [];
    try {
      const parsed: unknown = JSON.parse(await SecureStore.getItemAsync(accountIndexKey) || "[]");
      if (Array.isArray(parsed)) accountKeys = parsed.filter((item): item is string => typeof item === "string");
    } catch {}
    await Promise.all(accountKeys.map(key => SecureStore.deleteItemAsync(key)));
    await SecureStore.deleteItemAsync(accountIndexKey);
  }
}
