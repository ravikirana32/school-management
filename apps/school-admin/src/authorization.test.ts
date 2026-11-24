import { describe, expect, it } from "vitest";
import { hasSchoolPermission, visibleSchoolAdminTabs } from "./authorization";

describe("School Admin permission guards", () => {
  it("allows an exact permission", () => {
    expect(hasSchoolPermission(["students.read"], "students.read")).toBe(true);
  });

  it("allows module wildcard and global wildcard", () => {
    expect(hasSchoolPermission(["academics.*"], "academics.manage")).toBe(true);
    expect(hasSchoolPermission(["*"], "fees.manage")).toBe(true);
  });

  it("denies permissions not assigned to the active school membership", () => {
    expect(hasSchoolPermission(["attendance.read"], "attendance.manage")).toBe(false);
    expect(hasSchoolPermission([], "students.read")).toBe(false);
  });

  it("filters navigation by capability rather than role label", () => {
    const tabs = [
      { id: "students", permission: "students.read" },
      { id: "fees", permission: "fees.manage" },
      { id: "attendance", permission: "attendance.manage" },
    ];
    expect(visibleSchoolAdminTabs(tabs, ["students.read", "attendance.manage"]).map(x => x.id))
      .toEqual(["students", "attendance"]);
  });
});
