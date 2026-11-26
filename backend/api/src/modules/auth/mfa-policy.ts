export function isMfaEnabled(): boolean {
  const value = process.env.MFA_ENABLED;
  if (value === undefined || value === "false") return false;
  if (value === "true") return true;
  throw new Error("MFA_ENABLED must be either true or false.");
}
