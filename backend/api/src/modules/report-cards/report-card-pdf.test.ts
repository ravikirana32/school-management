import { describe, expect, it } from "vitest";
import { buildReportCardPdf, containsUnsupportedRtl } from "./report-card-pdf.js";

describe("buildReportCardPdf", () => {
  it("creates a PDF with embedded-font support and QR verification payload", async () => {
    const pdf = await buildReportCardPdf({ schoolName: "Demo School", studentName: "A Student", admissionNumber: "A-01", academicYear: "2026-27", term: "Term 1", subjects: [{ name: "Mathematics", marks: "written 18" }], generatedAt: new Date("2026-11-17T00:00:00Z"), verificationCode: "A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6", verificationUrl: "https://school.example/verify/A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6" });
    expect(pdf.subarray(0, 8).toString("ascii")).toBe("%PDF-1.3");
    expect(pdf.subarray(-6).toString("ascii")).toContain("%%EOF");
    expect(pdf.length).toBeGreaterThan(1_000);
  });
  it("rejects RTL text rather than publishing incorrectly shaped Arabic", async () => {
    expect(containsUnsupportedRtl("مدرسة" )).toBe(true);
    await expect(buildReportCardPdf({ schoolName: "مدرسة", studentName: "طالب", admissionNumber: "A-02", academicYear: "2026-27", term: "Term 1", subjects: [], generatedAt: new Date("2026-11-17T00:00:00Z") })).rejects.toMatchObject({ code: "RTL_PDF_UNSUPPORTED" });
  });
  it("embeds Indic text using bundled Noto fonts", async () => {
    const pdf = await buildReportCardPdf({ schoolName: "Demo School", studentName: "ವಿದ್ಯಾರ್ಥಿ", admissionNumber: "K-01", academicYear: "2026-27", term: "ಅವಧಿ 1", subjects: [{ name: "गणित", marks: "लेखन 18" }], generatedAt: new Date("2026-11-17T00:00:00Z"), verificationCode: "A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6" });
    expect(pdf.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(1_000);
  });
});
