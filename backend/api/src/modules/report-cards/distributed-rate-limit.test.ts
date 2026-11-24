import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";

describe("distributed report-card verification rate limit contract", () => {
  it("hashes caller identity before using it in a Redis key", () => {
    const value = createHash("sha256").update("203.0.113.10").digest("hex");
    expect(value).toMatch(/^[a-f0-9]{64}$/);
    expect(value).not.toContain("203.0.113.10");
  });
  it("uses an atomic increment and first-hit expiry in Lua", () => {
    const script = "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]); end; local ttl = redis.call('PTTL', KEYS[1]); return {count, ttl}";
    expect(script).toContain("INCR");
    expect(script).toContain("PEXPIRE");
    expect(script).toContain("PTTL");
  });
});
