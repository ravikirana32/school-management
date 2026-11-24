export type SchoolAdminTab = { id: string; permission: string; previewOnly?: boolean };

/** Exact permission checks with the same module-wildcard semantics as the API. */
export function hasSchoolPermission(permissions: readonly string[], required: string): boolean {
  if (permissions.includes("*")) return true;
  if (permissions.includes(required)) return true;
  const moduleName = required.split(".")[0];
  return permissions.includes(`${moduleName}.*`);
}

export function visibleSchoolAdminTabs<T extends SchoolAdminTab>(tabs: readonly T[], permissions: readonly string[]): T[] {
  return tabs.filter(tab => hasSchoolPermission(permissions, tab.permission));
}
