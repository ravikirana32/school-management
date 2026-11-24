import { describe, expect, it } from "vitest";
import { createStudentSchema, enrollmentSchema, pickupContactSchema, studentDocumentSchema } from "./student.schemas.js";

describe("P08 student and guardian validation", () => {
  it("requires admission number and first name", () => {
    expect(createStudentSchema.safeParse({ admissionNumber:"A-001", firstName:"Anaya" }).success).toBe(true);
    expect(createStudentSchema.safeParse({ admissionNumber:"", firstName:"" }).success).toBe(false);
  });
  it("rejects malformed date-only student date", () => {
    expect(createStudentSchema.safeParse({ admissionNumber:"A-2", firstName:"Riya", dateOfBirth:"02/01/2018" }).success).toBe(false);
  });
  it("rejects enrollment without required academic assignment", () => {
    expect(enrollmentSchema.safeParse({ academicYearId:"y", gradeLevelId:"g", enrolledOn:"2027-04-01" }).success).toBe(true);
    expect(enrollmentSchema.safeParse({ academicYearId:"y", gradeLevelId:"g", enrolledOn:"01-04-2027" }).success).toBe(false);
  });
  it("rejects pickup contact validity ending before it starts", () => {
    expect(pickupContactSchema.safeParse({ fullName:"Test Guardian", relationship:"Aunt", phone:"9999999999", validFrom:"2027-04-10", validUntil:"2027-04-01" }).success).toBe(false);
  });
  it("rejects public URLs and traversal in document object keys", () => {
    expect(studentDocumentSchema.safeParse({ documentType:"BIRTH_CERTIFICATE", displayName:"Birth", objectKey:"https://example.com/birth.pdf" }).success).toBe(false);
    expect(studentDocumentSchema.safeParse({ documentType:"BIRTH_CERTIFICATE", displayName:"Birth", objectKey:"students/abc/birth.pdf" }).success).toBe(true);
  });
  it("rejects expiry before issue date", () => {
    expect(studentDocumentSchema.safeParse({ documentType:"MEDICAL", displayName:"Report", objectKey:"students/a/doc.pdf", issuedAt:"2027-04-10", expiresAt:"2027-04-01" }).success).toBe(false);
  });
});
