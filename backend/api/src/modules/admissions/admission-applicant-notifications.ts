/** P229 applicant-facing admissions inbox primitives. */
export async function createApplicantNotification(tx: any, input: { organizationId: string; schoolId: string; applicationId: string; eventKey: string; eventType: string; title: string; body: string }) {
  return tx.admissionApplicantNotification.upsert({
    where: { eventKey: input.eventKey },
    create: input,
    update: {},
  });
}
