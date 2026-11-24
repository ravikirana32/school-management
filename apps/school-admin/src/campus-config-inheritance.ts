/** Campus configuration inheritance foundation. Arrays replace; plain objects merge recursively; null is an explicit override. */
export const CAMPUS_INHERITABLE_SCOPES = ["profile", "working", "policies"] as const;
export type CampusConfigScope = typeof CAMPUS_INHERITABLE_SCOPES[number];
export type CampusConfigInheritanceDocument = {
  format: "school-saas-campus-overrides";
  version: 1;
  campusId: string;
  parentCampusId?: string | null;
  inheritedScopes: CampusConfigScope[];
  overrides: Partial<Record<CampusConfigScope, unknown>>;
};
const forbiddenKeys = new Set(["__proto__", "prototype", "constructor"]);
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
export function mergeCampusConfig<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return (override === undefined ? base : override) as T;
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    if (forbiddenKeys.has(key)) continue;
    const value = override[key];
    result[key] = isPlainObject(base[key]) && isPlainObject(value)
      ? mergeCampusConfig(base[key], value)
      : value;
  }
  return result as T;
}
export function resolveCampusConfig<T>(base: T, overrides: unknown, inherited = true): T {
  return inherited ? mergeCampusConfig(base, overrides) : (overrides === undefined ? base : overrides as T);
}
export function validateCampusInheritanceDocument(input: unknown): { valid: boolean; errors: string[]; data?: CampusConfigInheritanceDocument } {
  const errors: string[] = [];
  if (!isPlainObject(input)) return { valid: false, errors: ["Campus inheritance document must be an object."] };
  const doc = input as Record<string, unknown>;
  if (doc.format !== "school-saas-campus-overrides") errors.push("Unsupported campus inheritance format.");
  if (doc.version !== 1) errors.push("Unsupported campus inheritance version.");
  if (typeof doc.campusId !== "string" || !doc.campusId.trim()) errors.push("campusId is required.");
  if (doc.parentCampusId !== undefined && doc.parentCampusId !== null && (typeof doc.parentCampusId !== "string" || !doc.parentCampusId.trim())) errors.push("parentCampusId must be a non-empty string or null.");
  if (doc.parentCampusId === doc.campusId) errors.push("A campus cannot inherit from itself.");
  if (!Array.isArray(doc.inheritedScopes)) errors.push("inheritedScopes must be an array.");
  else {
    const scopes = doc.inheritedScopes as unknown[];
    const seen = new Set<string>();
    for (const scope of scopes) {
      if (typeof scope !== "string" || !CAMPUS_INHERITABLE_SCOPES.includes(scope as CampusConfigScope)) errors.push(`Unsupported inherited scope ${String(scope)}.`);
      else if (seen.has(scope)) errors.push(`Duplicate inherited scope ${scope}.`);
      else seen.add(scope);
    }
  }
  if (!isPlainObject(doc.overrides)) errors.push("overrides must be an object.");
  else {
    for (const key of Object.keys(doc.overrides)) {
      if (!CAMPUS_INHERITABLE_SCOPES.includes(key as CampusConfigScope)) errors.push(`Unsupported override scope ${key}.`);
      if (forbiddenKeys.has(key)) errors.push(`Unsafe override key ${key}.`);
    }
  }
  return { valid: errors.length === 0, errors, data: errors.length === 0 ? input as CampusConfigInheritanceDocument : undefined };
}

/** Resolve a campus and its parent chain from persisted inheritance documents. */
export function resolveCampusInheritanceChain<T extends Record<CampusConfigScope, unknown>>(
  baseConfig: T,
  documents: unknown[],
  campusId: string,
): { valid: boolean; errors: string[]; config?: T; chain?: string[] } {
  const errors: string[] = [];
  const byId = new Map<string, CampusConfigInheritanceDocument>();
  for (const raw of documents) {
    const checked = validateCampusInheritanceDocument(raw);
    if (!checked.valid || !checked.data) {
      errors.push(...checked.errors);
      continue;
    }
    if (byId.has(checked.data.campusId)) errors.push(`Duplicate campus document ${checked.data.campusId}.`);
    else byId.set(checked.data.campusId, checked.data);
  }
  if (errors.length) return { valid: false, errors };
  if (!byId.has(campusId)) return { valid: false, errors: [`Campus ${campusId} was not found.`] };
  const chain: string[] = [];
  const visited = new Set<string>();
  let current: CampusConfigInheritanceDocument | undefined = byId.get(campusId);
  while (current) {
    if (visited.has(current.campusId)) {
      errors.push(`Inheritance cycle detected at campus ${current.campusId}.`);
      break;
    }
    visited.add(current.campusId);
    chain.push(current.campusId);
    if (current.parentCampusId) {
      const parent = byId.get(current.parentCampusId);
      if (!parent) {
        errors.push(`Parent campus ${current.parentCampusId} was not found for ${current.campusId}.`);
        break;
      }
      current = parent;
    } else current = undefined;
  }
  if (errors.length) return { valid: false, errors, chain };
  const ordered = [...chain].reverse();
  const config = { ...baseConfig } as T;
  for (const id of ordered) {
    const document = byId.get(id)!;
    for (const scope of CAMPUS_INHERITABLE_SCOPES) {
      const override = document.overrides[scope];
      if (override === undefined) continue;
      config[scope] = document.inheritedScopes.includes(scope)
        ? mergeCampusConfig(config[scope], override)
        : override as T[typeof scope];
    }
  }
  return { valid: true, errors: [], config, chain: ordered };
}
