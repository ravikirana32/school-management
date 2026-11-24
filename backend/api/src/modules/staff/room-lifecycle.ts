export type RoomReferenceRow = { room: string | null; isActive: boolean };
export type CanonicalRoomRow = { code: string; isActive: boolean };

/** Build a read-only inventory of historical free-text labels; never mutates source rows. */
export function buildLegacyRoomUsageReport(
  slots: RoomReferenceRow[],
  exceptions: RoomReferenceRow[],
  rooms: CanonicalRoomRow[],
) {
  const roomByCode = new Map(rooms.map((room) => [room.code.toUpperCase(), room]));
  const counts = new Map<string, { label: string; slotReferences: number; exceptionReferences: number; activeSlotReferences: number; activeExceptionReferences: number }>();
  for (const row of slots) {
    if (!row.room?.trim()) continue;
    const label = row.room.trim();
    const item = counts.get(label) ?? { label, slotReferences: 0, exceptionReferences: 0, activeSlotReferences: 0, activeExceptionReferences: 0 };
    item.slotReferences += 1;
    if (row.isActive) item.activeSlotReferences += 1;
    counts.set(label, item);
  }
  for (const row of exceptions) {
    if (!row.room?.trim()) continue;
    const label = row.room.trim();
    const item = counts.get(label) ?? { label, slotReferences: 0, exceptionReferences: 0, activeSlotReferences: 0, activeExceptionReferences: 0 };
    item.exceptionReferences += 1;
    if (row.isActive) item.activeExceptionReferences += 1;
    counts.set(label, item);
  }
  const labels = [...counts.values()].sort((a, b) => a.label.localeCompare(b.label)).map((item) => {
    const match = roomByCode.get(item.label.toUpperCase());
    return { ...item, canonicalRoomCode: match?.code ?? null, canonicalRoomActive: match?.isActive ?? false, requiresReview: !match || item.label !== match.code };
  });
  return { labels, totalDistinctLabels: labels.length, unmappedLabels: labels.filter((item) => !item.canonicalRoomCode).length, normalizationReviewLabels: labels.filter((item) => item.canonicalRoomCode && item.requiresReview).length };
}

/** Stable normalization used for explicit legacy-label alias matching. */
export function normalizeRoomAliasLabel(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

export function buildRoomAliasMigrationSummary(
  alias: { aliasLabel: string; canonicalRoomCode: string },
  slots: RoomReferenceRow[],
  exceptions: RoomReferenceRow[],
) {
  const normalized = normalizeRoomAliasLabel(alias.aliasLabel);
  const slotMatches = slots.filter(row => normalizeRoomAliasLabel(row.room ?? "") === normalized);
  const exceptionMatches = exceptions.filter(row => normalizeRoomAliasLabel(row.room ?? "") === normalized);
  return {
    aliasLabel: alias.aliasLabel,
    canonicalRoomCode: alias.canonicalRoomCode,
    slotReferences: slotMatches.length,
    activeSlotReferences: slotMatches.filter(row => row.isActive).length,
    exceptionReferences: exceptionMatches.length,
    activeExceptionReferences: exceptionMatches.filter(row => row.isActive).length,
  };
}
