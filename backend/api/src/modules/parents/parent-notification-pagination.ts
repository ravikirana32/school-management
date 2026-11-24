export type NotificationCursor = {
  v: 1;
  lastCreatedAt: string;
  lastId: string;
  watermarkCreatedAt: string;
  watermarkId: string;
};

const MAX_CURSOR_LENGTH = 1024;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function encodeNotificationCursor(value: NotificationCursor): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

export function decodeNotificationCursor(value: unknown): NotificationCursor | null {
  if (typeof value !== "string" || value.length < 8 || value.length > MAX_CURSOR_LENGTH || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<NotificationCursor>;
    if (parsed.v !== 1 || typeof parsed.lastId !== "string" || !parsed.lastId || parsed.lastId.length > 128 || typeof parsed.watermarkId !== "string" || !parsed.watermarkId || parsed.watermarkId.length > 128) return null;
    if (typeof parsed.lastCreatedAt !== "string" || !ISO_DATE.test(parsed.lastCreatedAt) || Number.isNaN(Date.parse(parsed.lastCreatedAt))) return null;
    if (typeof parsed.watermarkCreatedAt !== "string" || !ISO_DATE.test(parsed.watermarkCreatedAt) || Number.isNaN(Date.parse(parsed.watermarkCreatedAt))) return null;
    if (parsed.lastCreatedAt > parsed.watermarkCreatedAt || (parsed.lastCreatedAt === parsed.watermarkCreatedAt && parsed.lastId > parsed.watermarkId)) return null;
    return parsed as NotificationCursor;
  } catch { return null; }
}

export function notificationPageSize(value: unknown): number {
  const n = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : 30;
  return Number.isSafeInteger(n) && n >= 1 && n <= 100 ? n : 30;
}

export function notificationSnapshotWhere(cursor: NotificationCursor) {
  return {
    AND: [
      { OR: [
        { createdAt: { lt: new Date(cursor.watermarkCreatedAt) } },
        { createdAt: new Date(cursor.watermarkCreatedAt), id: { lte: cursor.watermarkId } },
      ] },
      { OR: [
        { createdAt: { lt: new Date(cursor.lastCreatedAt) } },
        { createdAt: new Date(cursor.lastCreatedAt), id: { lt: cursor.lastId } },
      ] },
    ],
  };
}
