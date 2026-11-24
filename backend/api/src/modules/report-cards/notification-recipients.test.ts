import { describe, expect, it } from "vitest";
import { resolveReportCardNotificationRecipients } from "./notification-recipients.js";

describe("report-card notification recipients", () => {
  const links = [
    { guardianId: "g1", userId: "u1", canReceiveCommunications: true, guardianActive: true },
    { guardianId: "g2", userId: "u1", canReceiveCommunications: true, guardianActive: true },
    { guardianId: "g3", userId: "u3", canReceiveCommunications: true, guardianActive: true },
    { guardianId: "g4", userId: "u4", canReceiveCommunications: false, guardianActive: true },
    { guardianId: "g5", userId: "u5", canReceiveCommunications: true, guardianActive: false }
  ];
  it("deduplicates shared parent accounts and enforces consent, link and preference", () => {
    expect(resolveReportCardNotificationRecipients(links, new Set(["g1", "g2", "g3", "g4", "g5"]), new Set(["u3"]))).toEqual(["u1"]);
  });
  it("returns no recipients when no guardian consent exists", () => {
    expect(resolveReportCardNotificationRecipients(links, new Set(), new Set())).toEqual([]);
  });
  it("evaluates IN_APP and EMAIL preferences independently", () => {
    const consented = new Set(["g1", "g2", "g3"]);
    const inAppRecipients = resolveReportCardNotificationRecipients(links, consented, new Set(["u1"]));
    const emailRecipients = resolveReportCardNotificationRecipients(links, consented, new Set(["u3"]));
    expect(inAppRecipients).toEqual(["u3"]);
    expect(emailRecipients).toEqual(["u1"]);
  });
});
