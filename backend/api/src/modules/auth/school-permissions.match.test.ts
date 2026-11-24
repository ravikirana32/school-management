import { describe, expect, it } from "vitest";
import { matchesSchoolPermission } from "./school-permissions.js";

describe("school permission matching", () => {
  it("allows an exact permission", () => expect(matchesSchoolPermission(["students.read"], "students.read")).toBe(true));
  it("allows a module wildcard", () => expect(matchesSchoolPermission(["staff.*"], "staff.assign")).toBe(true));
  it("allows a global wildcard", () => expect(matchesSchoolPermission(["*"], "access.roles.manage")).toBe(true));
  it("denies unrelated modules and actions", () => {
    expect(matchesSchoolPermission(["students.read"], "students.create")).toBe(false);
    expect(matchesSchoolPermission(["staff.*"], "students.read")).toBe(false);
  });
  it("does not treat a partial prefix as a wildcard", () => expect(matchesSchoolPermission(["students.rea*"], "students.read")).toBe(false));
});
