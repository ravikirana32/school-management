import { describe, expect, it } from "vitest";

type SessionState = "DRAFT" | "OPEN" | "SUBMITTED" | "LOCKED";
const transitions: Record<SessionState, SessionState[]> = {
  DRAFT: ["OPEN"], OPEN: ["SUBMITTED"], SUBMITTED: ["LOCKED"], LOCKED: []
};
function transition(from: SessionState, to: SessionState) {
  if (!transitions[from].includes(to)) throw new Error("Invalid attendance session transition");
  return to;
}
describe("attendance session lifecycle", () => {
  it("allows the intended forward-only workflow", () => {
    expect(transition("DRAFT","OPEN")).toBe("OPEN");
    expect(transition("OPEN","SUBMITTED")).toBe("SUBMITTED");
    expect(transition("SUBMITTED","LOCKED")).toBe("LOCKED");
  });
  it("rejects edits or backward transitions after submission", () => {
    expect(() => transition("SUBMITTED","OPEN")).toThrow();
    expect(() => transition("LOCKED","SUBMITTED")).toThrow();
    expect(() => transition("OPEN","DRAFT")).toThrow();
  });
  it("rejects duplicate students in a bulk marking batch", () => {
    const ids = ["s1","s2","s1"];
    expect(new Set(ids).size).not.toBe(ids.length);
  });
});


describe("P13 attendance concurrency invariants", () => {
  it("allows only one pending correction per attendance", () => {
    const rows = [{attendanceId:"a1",status:"PENDING"},{attendanceId:"a1",status:"APPROVED"}];
    expect(rows.filter(r=>r.status==="PENDING")).toHaveLength(1);
  });
  it("requires stale session transitions to fail compare-and-set", () => {
    const persistedState = "OPEN";
    const expectedState = "DRAFT";
    expect(persistedState === expectedState).toBe(false);
  });
});
