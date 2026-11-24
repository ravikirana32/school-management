import { describe, expect, it } from "vitest";
import { hasPermission, type AuthorizationContext } from "./permissions.js";
import { matchesSchoolPermission } from "./school-permissions.js";

// Synthetic fixtures: these tests exercise helper contracts only, not live memberships or routes.
const fixtures: Record<string, AuthorizationContext> = {
  platformAdmin: { userId: "pa-1", permissions: new Set(), isPlatformAdmin: true },
  schoolAdmin: { userId: "sa-1", organizationId: "org-1", schoolId: "school-1", permissions: new Set(["students.*", "attendance.*", "school.settings.manage"]) },
  principal: { userId: "pr-1", organizationId: "org-1", schoolId: "school-1", permissions: new Set(["students.*", "staff.*", "attendance.*", "reports.read"]) },
  departmentHead: { userId: "dh-1", organizationId: "org-1", schoolId: "school-1", permissions: new Set(["attendance.*", "students.read", "reports.read"]) },
  teacher: { userId: "t-1", organizationId: "org-1", schoolId: "school-1", permissions: new Set(["attendance.*", "students.read", "homework.manage"]) },
  frontOffice: { userId: "fo-1", organizationId: "org-1", schoolId: "school-1", permissions: new Set(["students.read", "admissions.manage", "attendance.read"]) },
  finance: { userId: "fi-1", organizationId: "org-1", schoolId: "school-1", permissions: new Set(["fees.*", "finance.reports.read"]) },
  parent: { userId: "pa-2", organizationId: "org-1", schoolId: "school-1", permissions: new Set(["students.read", "attendance.read", "fees.read"]) },
  libraryStaff: { userId: "ls-1", organizationId: "org-1", schoolId: "school-1", permissions: new Set(["library.*", "students.read"]) },
  transportStaff: { userId: "ts-1", organizationId: "org-1", schoolId: "school-1", permissions: new Set(["transport.*", "students.read"]) },
  hostelStaff: { userId: "hs-1", organizationId: "org-1", schoolId: "school-1", permissions: new Set(["hostel.*", "students.read"]) },
  canteenStaff: { userId: "cs-1", organizationId: "org-1", schoolId: "school-1", permissions: new Set(["canteen.*", "students.read"]) },
};

describe("P467 role permission matrix contract", () => {
  it("platform admin fixture allows a permission without grants", () => expect(hasPermission(fixtures.platformAdmin, "system.audit.manage")).toBe(true));
  it("school admin fixture has student module wildcard", () => expect(hasPermission(fixtures.schoolAdmin, "students.delete")).toBe(true));
  it("school admin fixture does not inherit finance grants", () => expect(hasPermission(fixtures.schoolAdmin, "fees.manage")).toBe(false));
  it("principal fixture has staff module access", () => expect(hasPermission(fixtures.principal, "staff.update")).toBe(true));
  it("principal fixture denies transport access absent grant", () => expect(hasPermission(fixtures.principal, "transport.manage")).toBe(false));
  it("department head has attendance wildcard", () => expect(hasPermission(fixtures.departmentHead, "attendance.manage")).toBe(true));
  it("department head denies finance access", () => expect(hasPermission(fixtures.departmentHead, "fees.read")).toBe(false));
  it("teacher can manage homework by fixture grant", () => expect(hasPermission(fixtures.teacher, "homework.manage")).toBe(true));
  it("teacher denies staff management", () => expect(hasPermission(fixtures.teacher, "staff.manage")).toBe(false));
  it("front office can manage admissions", () => expect(hasPermission(fixtures.frontOffice, "admissions.manage")).toBe(true));
  it("front office denies fee management", () => expect(hasPermission(fixtures.frontOffice, "fees.manage")).toBe(false));
  it("finance fixture can manage fees", () => expect(hasPermission(fixtures.finance, "fees.manage")).toBe(true));
  it("finance fixture denies classroom attendance management", () => expect(hasPermission(fixtures.finance, "attendance.manage")).toBe(false));
  it("parent fixture can read student information", () => expect(hasPermission(fixtures.parent, "students.read")).toBe(true));
  it("parent fixture denies student update", () => expect(hasPermission(fixtures.parent, "students.update")).toBe(false));
  it("library staff wildcard is module-local", () => expect(hasPermission(fixtures.libraryStaff, "library.issue.manage")).toBe(true));
  it("library staff denies transport wildcard", () => expect(hasPermission(fixtures.libraryStaff, "transport.manage")).toBe(false));
  it("transport staff fixture allows transport module", () => expect(hasPermission(fixtures.transportStaff, "transport.routes.manage")).toBe(true));
  it("hostel staff fixture allows hostel module", () => expect(hasPermission(fixtures.hostelStaff, "hostel.rooms.manage")).toBe(true));
  it("canteen staff fixture allows canteen module", () => expect(hasPermission(fixtures.canteenStaff, "canteen.menu.manage")).toBe(true));
  it("school-permission matcher accepts module wildcard", () => expect(matchesSchoolPermission(["library.*"], "library.issue.manage")).toBe(true));
  it("school-permission matcher denies unrelated module", () => expect(matchesSchoolPermission(["library.*"], "fees.read")).toBe(false));
  it("school-permission matcher accepts exact key", () => expect(matchesSchoolPermission(["fees.read"], "fees.read")).toBe(true));
  it("school-permission matcher accepts global wildcard", () => expect(matchesSchoolPermission(["*"], "transport.manage")).toBe(true));
});
