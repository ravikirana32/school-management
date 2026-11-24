# P09 Admissions data model

Tables: AdmissionEnquiry, AdmissionApplication, AdmissionApplicationDocument, AdmissionStageHistory, AdmissionOffer, GradeSectionCapacity, AdmissionFeeHandoff. All records include organizationId and schoolId. SQL migration adds composite tenant FKs to AcademicYear and GradeLevel, application-child composite FKs, indexes and forced RLS policies requiring both tenant session settings. Application number and offer number are unique per school. The migration has not been applied to a live/test database in this phase.
