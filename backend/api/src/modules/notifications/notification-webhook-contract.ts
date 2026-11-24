import { z } from "zod";

export const notificationDeliveryEventSchema = z.object({
  contractVersion: z.literal("v1").default("v1"),
  id: z.string().min(1).max(200),
  type: z.enum(["email.delivered", "email.bounced", "email.complained"]),
  occurredAt: z.string().datetime({ offset: true }),
  data: z.object({ outboxId: z.string().min(1).max(128), messageId: z.string().max(200).optional() }).strict(),
}).strict();

export type NotificationDeliveryEvent = z.infer<typeof notificationDeliveryEventSchema>;
export type NotificationDeliveryEventType = "DELIVERED" | "BOUNCED" | "COMPLAINED";

export function toNotificationDeliveryEventType(type: NotificationDeliveryEvent["type"]): NotificationDeliveryEventType {
  switch (type) {
    case "email.delivered": return "DELIVERED";
    case "email.bounced": return "BOUNCED";
    case "email.complained": return "COMPLAINED";
  }
}
