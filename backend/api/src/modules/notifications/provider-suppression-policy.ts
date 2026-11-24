/** A delayed provider event must not undo a human release that happened after that event. */
export function shouldCreateProviderSuppression(
  latestStatus: string | null,
  latestReleasedAt: Date | null,
  eventOccurredAt: Date,
): boolean {
  if (!Number.isFinite(eventOccurredAt.getTime())) return false;
  if (latestStatus === "RELEASED" && latestReleasedAt && latestReleasedAt.getTime() >= eventOccurredAt.getTime()) return false;
  return true;
}
