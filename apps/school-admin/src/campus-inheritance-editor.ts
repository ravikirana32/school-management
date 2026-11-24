import { CAMPUS_INHERITABLE_SCOPES, type CampusConfigInheritanceDocument, type CampusConfigScope, validateCampusInheritanceDocument } from "./campus-config-inheritance";

const unsafeSegments = new Set(["__proto__", "prototype", "constructor"]);
const isPlain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map(cloneValue) as T;
  if (!isPlain(value)) return value;
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) if (!unsafeSegments.has(key)) result[key] = cloneValue(item);
  return result as T;
}

export function createCampusInheritanceDraft(campusId: string, parentCampusId: string | null = null): CampusConfigInheritanceDocument {
  const draft: CampusConfigInheritanceDocument = { format: "school-saas-campus-overrides", version: 1, campusId, parentCampusId, inheritedScopes: [...CAMPUS_INHERITABLE_SCOPES], overrides: {} };
  const validation = validateCampusInheritanceDocument(draft);
  if (!validation.valid) throw new Error(validation.errors.join(" "));
  return draft;
}

export function setCampusScopeInheritance(document: CampusConfigInheritanceDocument, scope: CampusConfigScope, inherit: boolean): CampusConfigInheritanceDocument {
  if (!CAMPUS_INHERITABLE_SCOPES.includes(scope)) throw new Error(`Unsupported campus configuration scope ${scope}.`);
  const inheritedScopes = new Set(document.inheritedScopes);
  if (inherit) inheritedScopes.add(scope); else inheritedScopes.delete(scope);
  return { ...document, inheritedScopes: orderScopes([...inheritedScopes]), overrides: cloneValue(document.overrides) };
}
function orderScopes(scopes: CampusConfigScope[]): CampusConfigScope[] { return CAMPUS_INHERITABLE_SCOPES.filter(scope => scopes.includes(scope)); }
export function setCampusScopeOverride(document: CampusConfigInheritanceDocument, scope: CampusConfigScope, value: unknown): CampusConfigInheritanceDocument {
  if (!CAMPUS_INHERITABLE_SCOPES.includes(scope)) throw new Error(`Unsupported campus configuration scope ${scope}.`);
  const overrides = cloneValue(document.overrides);
  overrides[scope] = cloneValue(value);
  return { ...document, overrides };
}
export function removeCampusScopeOverride(document: CampusConfigInheritanceDocument, scope: CampusConfigScope): CampusConfigInheritanceDocument {
  if (!CAMPUS_INHERITABLE_SCOPES.includes(scope)) throw new Error(`Unsupported campus configuration scope ${scope}.`);
  const overrides = cloneValue(document.overrides);
  delete overrides[scope];
  return { ...document, overrides };
}
/** Updates a dot-delimited path inside a scope override. Arrays are replaced as values; path traversal is object-only. */
export function setCampusOverridePath(document: CampusConfigInheritanceDocument, scope: CampusConfigScope, path: string, value: unknown): CampusConfigInheritanceDocument {
  const segments = path.split(".").map(segment => segment.trim());
  if (!path.trim() || segments.some(segment => !segment || unsafeSegments.has(segment))) throw new Error("Override path is empty or contains an unsafe segment.");
  const current = document.overrides[scope];
  const root = isPlain(current) ? cloneValue(current) : {};
  let cursor = root;
  for (const segment of segments.slice(0, -1)) {
    if (!isPlain(cursor[segment])) cursor[segment] = {};
    cursor = cursor[segment] as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]] = cloneValue(value);
  return setCampusScopeOverride(document, scope, root);
}
export function summarizeCampusOverrideScopes(document: CampusConfigInheritanceDocument): Array<{ scope: CampusConfigScope; inherited: boolean; hasOverride: boolean }> {
  return CAMPUS_INHERITABLE_SCOPES.map(scope => ({ scope, inherited: document.inheritedScopes.includes(scope), hasOverride: Object.prototype.hasOwnProperty.call(document.overrides, scope) }));
}
