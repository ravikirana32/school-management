export type NotificationPageQuery = { limit?: unknown; cursor?: unknown };
export type NotificationPageOptions = { limit: number; cursor?: string; invalidCursor: boolean };

export function parseNotificationPageOptions(query: NotificationPageQuery): NotificationPageOptions {
  const rawLimit = typeof query.limit === "string" ? Number(query.limit) : 50;
  const limit = Number.isInteger(rawLimit) ? Math.max(1, Math.min(100, rawLimit)) : 50;
  if (query.cursor === undefined) return { limit, invalidCursor: false };
  if (typeof query.cursor !== "string" || query.cursor.length < 1 || query.cursor.length > 128) return { limit, invalidCursor: true };
  return { limit, cursor: query.cursor, invalidCursor: false };
}
