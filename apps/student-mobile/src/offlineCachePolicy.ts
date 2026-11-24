/** Pure helpers for account-scoped offline cache policy. */
export const STUDENT_CACHE_VERSION = 1;
export const DEFAULT_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function studentCacheKey(organizationId: string, schoolId: string, accountId: string, resource: string): string {
  return `student-cache:v${STUDENT_CACHE_VERSION}:${encodeURIComponent(organizationId)}:${encodeURIComponent(schoolId)}:${encodeURIComponent(accountId)}:${encodeURIComponent(resource)}`;
}

export function isCacheFresh(savedAt: number, now = Date.now(), maxAgeMs = DEFAULT_CACHE_MAX_AGE_MS): boolean {
  return Number.isFinite(savedAt) && savedAt > 0 && now >= savedAt && now - savedAt <= maxAgeMs;
}

export function cacheEnvelope<T>(data: T, savedAt = Date.now()) {
  return { version: STUDENT_CACHE_VERSION, savedAt, data };
}
export function validateCacheEnvelope<T>(value: unknown): value is { version: number; savedAt: number; data: T } {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as Record<string, unknown>;
  return envelope.version === STUDENT_CACHE_VERSION && typeof envelope.savedAt === 'number' && 'data' in envelope;
}
