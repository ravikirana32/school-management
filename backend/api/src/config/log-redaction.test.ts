import { describe, expect, it } from "vitest";
import { LOG_REDACTION_PATHS } from "./log-redaction.js";

describe("structured log redaction paths", () => {
  it("redacts authorization, cookies and webhook signature headers", () => {
    expect(LOG_REDACTION_PATHS).toContain("req.headers.authorization");
    expect(LOG_REDACTION_PATHS).toContain("req.headers.cookie");
    expect(LOG_REDACTION_PATHS).toContain('req.headers["x-school-email-signature"]');
  });
  it("redacts email, HMAC, verification and provider credentials", () => {
    for (const key of ["email", "emailHash", "verificationCode", "providerToken", "secret", "signature", "rawBody"]) {
      expect(LOG_REDACTION_PATHS).toContain(key);
      expect(LOG_REDACTION_PATHS).toContain(`*.${key}`);
    }
  });
  it("redacts request payloads rather than logging notification content", () => {
    expect(LOG_REDACTION_PATHS).toContain("req.body.payload");
    expect(LOG_REDACTION_PATHS).toContain("req.body.email");
  });
});
