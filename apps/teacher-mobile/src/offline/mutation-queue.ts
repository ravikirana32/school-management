import * as SecureStore from "expo-secure-store";

export type MutationStatus = "PENDING" | "CONFLICT" | "FAILED";
export type QueuedMutation = {
  id: string;
  organizationId: string;
  schoolId: string;
  path: string;
  method: "POST";
  body: unknown;
  idempotencyKey: string;
  status: MutationStatus;
  attempts: number;
  nextAttemptAt: number;
  lastError?: string;
  createdAt: number;
  updatedAt: number;
};

const PREFIX = "school.teacher.offline.queue.v1";
const SNAPSHOT_PREFIX = "school.teacher.offline.snapshot.v1";
const MAX_RECORD_CHARS = 1800;
const MAX_QUEUE_ITEMS = 200;

function accountScope(email: string) {
  let hashA = 2166136261, hashB = 5381;
  for (const char of email.trim().toLowerCase()) {
    hashA = Math.imul(hashA ^ char.charCodeAt(0), 16777619);
    hashB = Math.imul(hashB, 33) ^ char.charCodeAt(0);
  }
  return `${(hashA >>> 0).toString(16)}${(hashB >>> 0).toString(16)}`;
}
function indexKey(email: string, organizationId: string, schoolId: string) {
  return `${PREFIX}.index.${accountScope(email)}.${encodeURIComponent(organizationId)}.${encodeURIComponent(schoolId)}`;
}
function itemKey(email: string, id: string) {
  return `${PREFIX}.item.${accountScope(email)}.${id}`;
}
async function readIndex(email: string, organizationId: string, schoolId: string): Promise<string[]> {
  try {
    const parsed: unknown = JSON.parse(await SecureStore.getItemAsync(indexKey(email, organizationId, schoolId)) || "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch { return []; }
}


function snapshotIndexKey(email: string) {
  return `${SNAPSHOT_PREFIX}.index.${accountScope(email)}`;
}
function snapshotKey(email: string, kind: string) {
  return `${SNAPSHOT_PREFIX}.${accountScope(email)}.${encodeURIComponent(kind)}`;
}
export async function writeTeacherAccountSnapshot(email: string, kind: string, value: unknown) {
  if (!email.trim() || !kind) return;
  const key = snapshotKey(email, kind);
  const serialized = JSON.stringify({ savedAt: Date.now(), value });
  if (serialized.length > 9000) return;
  await SecureStore.setItemAsync(key, serialized);
  let index: string[] = [];
  try {
    const parsed: unknown = JSON.parse(await SecureStore.getItemAsync(snapshotIndexKey(email)) || "[]");
    if (Array.isArray(parsed)) index = parsed.filter((item): item is string => typeof item === "string");
  } catch {}
  await SecureStore.setItemAsync(snapshotIndexKey(email), JSON.stringify([...new Set([...index, key])].slice(-100)));
}
export async function readTeacherAccountSnapshot<T>(email: string, kind: string): Promise<T | null> {
  if (!email.trim() || !kind) return null;
  const key = snapshotKey(email, kind);
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return null;
  try {
    const record = JSON.parse(raw) as { savedAt: number; value: T };
    if (!Number.isFinite(record.savedAt) || Date.now() - record.savedAt > 24 * 60 * 60 * 1000) {
      await SecureStore.deleteItemAsync(key);
      return null;
    }
    return record.value;
  } catch {
    await SecureStore.deleteItemAsync(key);
    return null;
  }
}

export function createIdempotencyKey() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

export async function enqueueTeacherMutation(input: {
  email: string; organizationId: string; schoolId: string; path: string;
  body: unknown; idempotencyKey: string;
}) {
  if (!input.email.trim() || !input.organizationId || !input.schoolId) throw new Error("Account and school scope are required before queueing work.");
  if (!input.path.includes("/attendance/sessions/") || !input.path.endsWith("/marks")) throw new Error("Only attendance mark batches can be queued offline.");
  const now = Date.now();
  const id = createIdempotencyKey();
  const record: QueuedMutation = {
    id, organizationId: input.organizationId, schoolId: input.schoolId,
    path: input.path, method: "POST", body: input.body, idempotencyKey: input.idempotencyKey,
    status: "PENDING", attempts: 0, nextAttemptAt: now, createdAt: now, updatedAt: now
  };
  const serialized = JSON.stringify(record);
  if (serialized.length > MAX_RECORD_CHARS) throw new Error("Offline batch is too large. Reduce the batch size and retry.");
  const ids = await readIndex(input.email, input.organizationId, input.schoolId);
  if (ids.length >= MAX_QUEUE_ITEMS) throw new Error("Offline queue is full. Sync pending attendance before adding more.");
  await SecureStore.setItemAsync(itemKey(input.email, id), serialized);
  await SecureStore.setItemAsync(indexKey(input.email, input.organizationId, input.schoolId), JSON.stringify([...ids, id]));
  return record;
}

export async function listTeacherMutations(email: string, organizationId: string, schoolId: string): Promise<QueuedMutation[]> {
  const ids = await readIndex(email, organizationId, schoolId);
  const records: QueuedMutation[] = [];
  const retained: string[] = [];
  for (const id of ids) {
    const raw = await SecureStore.getItemAsync(itemKey(email, id));
    if (!raw) continue;
    try {
      const record = JSON.parse(raw) as QueuedMutation;
      if (record.organizationId !== organizationId || record.schoolId !== schoolId) {
        await SecureStore.deleteItemAsync(itemKey(email, id));
        continue;
      }
      records.push(record); retained.push(id);
    } catch { await SecureStore.deleteItemAsync(itemKey(email, id)); }
  }
  if (retained.length !== ids.length) await SecureStore.setItemAsync(indexKey(email, organizationId, schoolId), JSON.stringify(retained));
  return records.sort((a, b) => a.createdAt - b.createdAt);
}

async function saveRecord(email: string, record: QueuedMutation) {
  record.updatedAt = Date.now();
  const serialized = JSON.stringify(record);
  if (serialized.length > MAX_RECORD_CHARS) throw new Error("Queue record exceeded the secure storage limit.");
  await SecureStore.setItemAsync(itemKey(email, record.id), serialized);
}

export async function discardTeacherMutation(email: string, organizationId: string, schoolId: string, id: string) {
  await SecureStore.deleteItemAsync(itemKey(email, id));
  const ids = await readIndex(email, organizationId, schoolId);
  await SecureStore.setItemAsync(indexKey(email, organizationId, schoolId), JSON.stringify(ids.filter(value => value !== id)));
}

export async function retryTeacherMutation(email: string, organizationId: string, schoolId: string, id: string) {
  const rows = await listTeacherMutations(email, organizationId, schoolId);
  const row = rows.find(item => item.id === id);
  if (!row) return;
  row.status = "PENDING"; row.nextAttemptAt = Date.now(); row.lastError = undefined;
  await saveRecord(email, row);
}

export async function flushTeacherMutations(
  email: string, organizationId: string, schoolId: string,
  send: (path: string, method: "POST", body: unknown, idempotencyKey: string) => Promise<unknown>
) {
  const rows = await listTeacherMutations(email, organizationId, schoolId);
  let synced = 0, conflicts = 0, failed = 0, deferred = 0;
  for (const row of rows) {
    if (row.status !== "PENDING" || row.nextAttemptAt > Date.now()) { deferred++; continue; }
    try {
      await send(row.path, row.method, row.body, row.idempotencyKey);
      await discardTeacherMutation(email, organizationId, schoolId, row.id);
      synced++;
    } catch (error) {
      const status = typeof error === "object" && error !== null && "status" in error ? Number((error as {status: unknown}).status) : 0;
      row.attempts++;
      row.lastError = error instanceof Error ? error.message.slice(0, 240) : "Sync failed";
      if (status === 409) {
        row.status = "CONFLICT"; conflicts++;
      } else if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
        row.status = "FAILED"; failed++;
      } else if (row.attempts >= 8) {
        row.status = "FAILED"; failed++;
      } else {
        row.nextAttemptAt = Date.now() + Math.min(15 * 60_000, 1000 * (2 ** row.attempts));
        deferred++;
      }
      await saveRecord(email, row);
    }
  }
  return { synced, conflicts, failed, deferred, remaining: (await listTeacherMutations(email, organizationId, schoolId)).length };
}
