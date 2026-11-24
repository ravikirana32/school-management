export type NotificationProviderFailureDisposition = "RETRY" | "PERMANENT";

/** Retry transient transport/server/rate-limit responses; do not retry invalid credentials or requests. */
export function classifyNotificationProviderFailure(status: number): NotificationProviderFailureDisposition {
  if (!Number.isInteger(status) || status < 100 || status > 599) return "PERMANENT";
  if (status === 408 || status === 425 || status === 429 || status >= 500) return "RETRY";
  return "PERMANENT";
}
