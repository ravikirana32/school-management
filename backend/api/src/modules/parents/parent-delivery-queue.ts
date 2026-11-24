import { Queue } from "bullmq";
import { env } from "../../config/env.js";

export const PARENT_DELIVERY_QUEUE = "parent-invitation-delivery";
let queue: Queue | undefined;
function redisConnection() {
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    ...(url.username ? { username: decodeURIComponent(url.username) } : {}),
    ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
    ...(url.protocol === "rediss:" ? { tls: {} } : {}),
    ...(url.pathname.length > 1 ? { db: Number(url.pathname.slice(1)) } : {}),
    maxRetriesPerRequest: null as null
  };
}
export function parentDeliveryQueue() {
  if (!queue) queue = new Queue(PARENT_DELIVERY_QUEUE, { connection: redisConnection() });
  return queue;
}
export async function enqueueParentInvitation(invitationId: string) {
  return parentDeliveryQueue().add("deliver", { invitationId }, {
    jobId: invitationId,
    attempts: 5,
    backoff: { type: "exponential", delay: 30_000 },
    removeOnComplete: { age: 7 * 24 * 60 * 60, count: 5000 },
    removeOnFail: false
  });
}
