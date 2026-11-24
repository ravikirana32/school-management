export type ParentListPage = { limit: number; cursorId?: string };

/** Decode an opaque, versioned keyset cursor. The route must still verify the
 * anchor row inside the caller's authenticated tenant and active filters. */
export function parseParentListPage(query: Record<string, unknown>): ParentListPage | null {
  const rawLimit = query.limit;
  let limit = 30;
  if (rawLimit !== undefined) {
    if (typeof rawLimit !== "string" && typeof rawLimit !== "number") return null;
    const parsedLimit = Number(rawLimit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) return null;
    limit = parsedLimit;
  }
  const rawCursor = query.cursor;
  if (rawCursor === undefined) return { limit };
  if (typeof rawCursor !== "string" || rawCursor.length < 1 || rawCursor.length > 512) return null;
  try {
    const raw = Buffer.from(rawCursor, "base64url").toString("utf8");
    const payload: unknown = JSON.parse(raw);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    const value = payload as Record<string, unknown>;
    if (Object.keys(value).length !== 2 || value.v !== 1 || typeof value.id !== "string" || value.id.length < 1 || value.id.length > 128) return null;
    return { limit, cursorId: value.id };
  } catch {
    return null;
  }
}

export function createParentListCursor(id: string): string {
  return Buffer.from(JSON.stringify({ v: 1, id })).toString("base64url");
}

export function buildParentListPage<T extends { id: string }>(rows: T[], limit: number) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return {
    items,
    hasMore,
    nextCursor: hasMore && items.length ? createParentListCursor(items[items.length - 1]!.id) : null,
  };
}
