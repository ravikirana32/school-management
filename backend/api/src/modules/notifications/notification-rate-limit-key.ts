import { createHash } from "node:crypto";

export function buildNotificationRateLimitKey(scope: string, identity: string): string {
  if (!/^[a-zA-Z0-9:_-]{1,100}$/.test(scope)) throw new Error("Invalid notification rate-limit scope");
  const digest = createHash("sha256").update(`${scope}\0${identity || "unknown"}`).digest("hex");
  return `notification:rate:${digest}`;
}
