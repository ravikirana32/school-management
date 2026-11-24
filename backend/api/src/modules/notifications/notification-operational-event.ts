export type NotificationOperationalEventName =
  | "notification.delivery.cancelled"
  | "notification.delivery.delivered"
  | "notification.delivery.dead_lettered"
  | "notification.delivery.skipped";

const allowedReasons = new Set(["unsupported_channel", "no_consented_recipient", "school_suppression", "permanent_provider_response", "lease_lost", "terminal_state"]);

/** Build an allowlisted operational log record; never copy arbitrary input properties. */
export function buildNotificationOperationalEvent(input: {
  event: NotificationOperationalEventName;
  outboxId: string;
  status: string;
  attempt?: number;
  reasonCode?: string;
  durationMs?: number;
}) {
  return {
    event: input.event,
    outboxId: /^[a-zA-Z0-9_-]{1,128}$/.test(input.outboxId) ? input.outboxId : "redacted",
    status: /^[A-Z_]{1,24}$/.test(input.status) ? input.status : "UNKNOWN",
    ...(Number.isInteger(input.attempt) && input.attempt! >= 0 ? { attempt: input.attempt } : {}),
    ...(input.reasonCode && allowedReasons.has(input.reasonCode) ? { reasonCode: input.reasonCode } : {}),
    ...(Number.isFinite(input.durationMs) && input.durationMs! >= 0 ? { durationMs: Math.min(Math.round(input.durationMs!), 3_600_000) } : {}),
  };
}
