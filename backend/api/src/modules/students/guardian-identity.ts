/** Normalizes contact keys for duplicate review only; never merges guardian records. */
export function normalizeGuardianEmail(value?: string | null): string | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized || undefined;
}

export function normalizeGuardianPhone(value?: string | null): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length < 5) return undefined;
  return raw.startsWith("+") ? `+${digits}` : digits;
}

export function hasGuardianContactMatch(input: { email?: string | null; phone?: string | null }, candidate: { email?: string | null; phone?: string | null }): boolean {
  const email = normalizeGuardianEmail(input.email);
  const phone = normalizeGuardianPhone(input.phone);
  return Boolean((email && email === normalizeGuardianEmail(candidate.email)) || (phone && phone === normalizeGuardianPhone(candidate.phone)));
}
