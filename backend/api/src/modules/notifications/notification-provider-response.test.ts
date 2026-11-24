import { describe, expect, it } from "vitest";
import { classifyNotificationProviderFailure } from "./notification-provider-response.js";

describe("notification provider response retry classification", () => {
  it.each([408, 425, 429, 500, 502, 503, 599])("retries transient HTTP %i", status => expect(classifyNotificationProviderFailure(status)).toBe("RETRY"));
  it.each([200, 301, 400, 401, 403, 404, 409, 422])("does not retry permanent/non-error HTTP %i", status => expect(classifyNotificationProviderFailure(status)).toBe("PERMANENT"));
  it("rejects invalid status values as permanent", () => {
    expect(classifyNotificationProviderFailure(99)).toBe("PERMANENT");
    expect(classifyNotificationProviderFailure(600)).toBe("PERMANENT");
    expect(classifyNotificationProviderFailure(Number.NaN)).toBe("PERMANENT");
  });
});
