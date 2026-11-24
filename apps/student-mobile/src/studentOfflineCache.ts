import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheEnvelope, isCacheFresh, studentCacheKey, validateCacheEnvelope } from './offlineCachePolicy';


export async function readStudentCache<T>(organizationId: string, schoolId: string, accountId: string, resource: string): Promise<{ data: T; savedAt: number; fresh: boolean } | null> {
  try {
    const raw = await AsyncStorage.getItem(studentCacheKey(organizationId, schoolId, accountId, resource));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!validateCacheEnvelope<T>(parsed)) return null;
    return { data: parsed.data, savedAt: parsed.savedAt, fresh: isCacheFresh(parsed.savedAt) };
  } catch {
    return null;
  }
}

export async function writeStudentCache<T>(organizationId: string, schoolId: string, accountId: string, resource: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(studentCacheKey(organizationId, schoolId, accountId, resource), JSON.stringify(cacheEnvelope(data)));
  } catch {
    // Cache failures must never prevent a successful network response from being displayed.
  }
}
export async function clearStudentCache(organizationId: string, schoolId: string, accountId: string): Promise<void> {
  try {
    const prefix = `student-cache:v${1}:${encodeURIComponent(organizationId)}:${encodeURIComponent(schoolId)}:${encodeURIComponent(accountId)}:`;
    const keys = await AsyncStorage.getAllKeys();
    const matching = keys.filter(key => key.startsWith(prefix));
    if (matching.length) await AsyncStorage.multiRemove(matching);
  } catch {
    // Local sign-out remains successful even if storage cleanup fails.
  }
}
