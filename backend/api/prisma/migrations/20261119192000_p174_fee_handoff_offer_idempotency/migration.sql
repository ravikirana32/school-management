-- Enforce one fee-handoff per offer (NULL offer IDs remain allowed for legacy/manual records).
CREATE UNIQUE INDEX "AdmissionFeeHandoff_org_school_offer_key"
ON "AdmissionFeeHandoff"("organizationId", "schoolId", "offerId");
