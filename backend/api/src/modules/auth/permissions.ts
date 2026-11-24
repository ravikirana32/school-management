export type ScopeType = "PLATFORM" | "ORGANIZATION" | "SCHOOL";
export type AuthorizationContext = {
  userId: string;
  organizationId?: string;
  schoolId?: string;
  permissions: ReadonlySet<string>;
  isPlatformAdmin?: boolean;
};

export function hasPermission(context: AuthorizationContext, permission: string): boolean {
  if (context.isPlatformAdmin) return true;
  if (context.permissions.has("*")) return true;
  if (context.permissions.has(permission)) return true;
  const [moduleName] = permission.split(".");
  return context.permissions.has(`${moduleName}.*`);
}

export function assertScope(context: AuthorizationContext, requested: { organizationId?: string; schoolId?: string }): void {
  if (context.isPlatformAdmin) return;
  if (requested.organizationId && requested.organizationId !== context.organizationId) {
    throw new Error("Organization scope mismatch");
  }
  if (requested.schoolId && requested.schoolId !== context.schoolId) {
    throw new Error("School scope mismatch");
  }
  if (requested.schoolId && !context.schoolId) throw new Error("School scope is required");
}
