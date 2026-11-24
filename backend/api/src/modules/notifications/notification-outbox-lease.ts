export const NOTIFICATION_OUTBOX_TERMINAL_STATES = ["DELIVERED", "CANCELLED", "DEAD_LETTER", "BOUNCED", "COMPLAINED"] as const;

export function isNotificationOutboxTerminal(status: string): boolean {
  return (NOTIFICATION_OUTBOX_TERMINAL_STATES as readonly string[]).includes(status);
}

export function isNotificationOutboxLeaseClaimable(status: string, leaseUntil: Date | null, now: Date): boolean {
  if (status === "PENDING" || status === "RETRY") return true;
  return status === "PROCESSING" && leaseUntil !== null && leaseUntil.getTime() < now.getTime();
}

export function buildNotificationOutboxClaimWhere(outboxId: string, now: Date) {
  return {
    id: outboxId,
    channel: "EMAIL",
    OR: [
      { status: { in: ["PENDING", "RETRY"] } },
      { status: "PROCESSING", leaseUntil: { lt: now } },
    ],
  } as const;
}
