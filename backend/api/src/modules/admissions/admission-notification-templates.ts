/**
 * P191: Safe admission notification template primitives.
 * Templates are plain text; no HTML execution is performed. Unknown variables are
 * deliberately rejected so a typo cannot silently produce an incomplete message.
 */
export const admissionNotificationTemplates = {
  APPLICATION_SUBMITTED: {
    title: "Application received — {{applicationNumber}}",
    body: "Hello {{guardianName}}, we received the admission application for {{studentName}} ({{applicationNumber}}). The school will review it and update the application status.",
  },
  DOCUMENT_REQUIRED: {
    title: "Documents required — {{applicationNumber}}",
    body: "Hello {{guardianName}}, additional documents are required for {{studentName}}'s admission application ({{applicationNumber}}). Please sign in to the admissions portal to review the checklist.",
  },
  OFFER_ISSUED: {
    title: "Admission offer — {{applicationNumber}}",
    body: "Hello {{guardianName}}, an admission offer is available for {{studentName}} ({{applicationNumber}}). Please review the offer and respond before its expiry date.",
  },
  OFFER_ACCEPTED: {
    title: "Offer accepted — {{applicationNumber}}",
    body: "Hello {{guardianName}}, your acceptance for {{studentName}} ({{applicationNumber}}) has been recorded. The school will share the next enrollment steps.",
  },
} as const;


export type AdmissionNotificationTemplateKey = keyof typeof admissionNotificationTemplates;
export type AdmissionNotificationVariables = Record<string, string | number | null | undefined>;
const variablePattern = /{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g;


export function renderAdmissionNotificationTemplate(
  template: string,
  variables: AdmissionNotificationVariables,
): string {
  const missing = new Set<string>();
  const rendered = template.replace(variablePattern, (_match, key: string) => {
    const value = variables[key];
    if (value === null || value === undefined) {
      missing.add(key);
      return "";
    }
    return String(value);
  });
  if (missing.size) throw new Error(`Missing admission notification variables: ${[...missing].sort().join(", ")}`);
  return rendered;
}


export function getAdmissionNotificationTemplate(key: AdmissionNotificationTemplateKey) {
  return admissionNotificationTemplates[key];
}
