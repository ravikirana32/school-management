/** Only draft operational records may transition to published. */
export function isDraftPublishable(status: string): boolean {
  return status === "DRAFT";
}

/** Keep result summaries generic across boards while rejecting empty/oversized payloads. */
export function isValidResultSummary(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value as Record<string, unknown>);
  return entries.length > 0 && entries.length <= 100 && entries.every(([key]) => key.trim().length > 0 && key.length <= 100);
}
