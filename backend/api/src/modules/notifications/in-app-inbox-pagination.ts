export type InboxCursor = { createdAt: string; id: string };
export function parseInboxLimit(value: unknown): number {
  if (typeof value !== 'string') return 50;
  const n = Number(value);
  return Number.isInteger(n) ? Math.max(1, Math.min(100, n)) : 50;
}
export function encodeInboxCursor(cursor: InboxCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}
export function decodeInboxCursor(value: unknown): InboxCursor | null {
  if (typeof value !== 'string' || value.length < 1 || value.length > 256) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Partial<InboxCursor>;
    if (typeof parsed.createdAt !== 'string' || typeof parsed.id !== 'string' || !parsed.id || !Number.isFinite(Date.parse(parsed.createdAt))) return null;
    return { createdAt: new Date(parsed.createdAt).toISOString(), id: parsed.id };
  } catch { return null; }
}
export function groupInboxRows<T extends { category?: string | null }>(rows: T[]) {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const category = row.category?.trim() || 'GENERAL';
    groups.set(category, [...(groups.get(category) ?? []), row]);
  }
  return [...groups.entries()].map(([category, items]) => ({ category, count: items.length, items }));
}
