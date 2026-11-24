/** Canonical operations-alert taxonomy. Keep payloads free of PII/secrets. */
export const OPERATIONS_ALERTS = {
  DOCUMENT_WORKER_DEGRADED: { severity: "CRITICAL", domain: "documents", recoveryEvent: "DOCUMENT_WORKER_RECOVERED" },
  DOCUMENT_SCAN_DISPATCH_FAILED: { severity: "ERROR", domain: "documents" },
  DOCUMENT_SCAN_DEAD_LETTER: { severity: "ERROR", domain: "documents" },
  REFUND_EVIDENCE_CLEANUP_FAILED: { severity: "WARNING", domain: "evidence" },
  OPERATIONS_ALERT_DELIVERY_FAILED: { severity: "WARNING", domain: "operations" },
  STORAGE_CONFIGURATION_UNAVAILABLE: { severity: "CRITICAL", domain: "storage" },
  REMINDER_AUDIT_EXPORT_WORKER_DEGRADED: { severity: "CRITICAL", domain: "exports", recoveryEvent: "REMINDER_AUDIT_EXPORT_WORKER_RECOVERED" },
  REMINDER_AUDIT_EXPORT_WORKER_STALE: { severity: "CRITICAL", domain: "exports", recoveryEvent: "REMINDER_AUDIT_EXPORT_WORKER_RECOVERED_FROM_STALE" },
  REMINDER_AUDIT_EXPORT_WORKER_RECOVERED: { severity: "INFO", domain: "exports" },
  REMINDER_AUDIT_EXPORT_WORKER_RECOVERED_FROM_STALE: { severity: "INFO", domain: "exports" },
} as const;
export type OperationsAlertEvent = keyof typeof OPERATIONS_ALERTS;
export type OperationsAlertSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";
export function operationsAlertSeverity(event: OperationsAlertEvent): OperationsAlertSeverity {
  return OPERATIONS_ALERTS[event].severity;
}
/** Stable dedupe keys are intentionally bounded and should never include personal data. */
export function operationsAlertDedupeKey(event: OperationsAlertEvent, subject: string, windowKey: string) {
  return `${event}:${subject.slice(0,100)}:${windowKey.slice(0,40)}`.slice(0,180);
}
