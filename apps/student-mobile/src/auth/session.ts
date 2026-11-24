import * as SecureStore from "expo-secure-store";

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  mfaPolicy?: MfaPolicy;
};

export type MfaPolicy = { required: boolean; reasons: string[]; challengeRequired: boolean; enrollmentRequired: boolean; sessionFresh: boolean; freshnessSeconds: number };
export type MfaEnrollment = { secret: string; otpauthUri: string; expiresInSeconds: number };


const REFRESH_TOKEN_KEY = "school.student.refresh-token.v1";
const API_BASE_KEY = "school.student.api-base.v1";
const ACCOUNT_EMAIL_KEY = "school.student.account-email.v1";
const ACCOUNT_ID_KEY = "school.student.account-id.v1";
const refreshInFlight = new Map<string, Promise<TokenPair>>();
function refreshLockKey(apiBaseUrl: string, token: string) {
  let hash = 2166136261;
  for (const char of `${apiBaseUrl.trim().replace(/\/+$/, "")}|${token}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16);
}

function apiRoot(apiBaseUrl: string) {
  const base = apiBaseUrl.trim().replace(/\/+$/, "");
  if (!/^https:\/\//i.test(base) && !/^http:\/\/localhost(?::\d+)?$/i.test(base) && !/^http:\/\/127\.0\.0\.1(?::\d+)?$/i.test(base)) {
    throw new Error("Use HTTPS for the school API. HTTP is allowed only for localhost development.");
  }
  return `${base}/api/v1`;
}

async function readJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const failure = new Error(body.error || `Authentication request failed (${response.status})`);
    (failure as Error & { status?: number }).status = response.status;
    throw failure;
  }
  return body;
}

export type AuthenticatedIdentity = { id: string; email: string; displayName?: string | null };

/** Validate the access token against the server-owned identity before exposing a mobile session. */
export async function fetchAuthenticatedIdentity(apiBaseUrl: string, accessToken: string, expectedRefreshToken?: string): Promise<AuthenticatedIdentity> {
  const response = await fetch(`${apiRoot(apiBaseUrl)}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const payload = await readJson(response) as { user?: AuthenticatedIdentity };
  const identity = payload.user;
  if (!identity?.id || !identity.email || !identity.email.trim()) {
    throw new Error("The server did not return a valid authenticated identity.");
  }
  if (expectedRefreshToken && await SecureStore.getItemAsync(REFRESH_TOKEN_KEY) !== expectedRefreshToken) {
    throw new Error("The active account changed during identity validation.");
  }
  identity.email = identity.email.trim().toLowerCase();
  // The server user ID is the stable account boundary; email is display/contact data.
  await SecureStore.setItemAsync(ACCOUNT_ID_KEY, identity.id);
  await SecureStore.setItemAsync(ACCOUNT_EMAIL_KEY, identity.email);
  return identity;
}

export async function signIn(apiBaseUrl: string, email: string, password: string): Promise<TokenPair> {
  const response = await fetch(`${apiRoot(apiBaseUrl)}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password })
  });
  const pair = await readJson(response) as TokenPair;
  if (!pair.accessToken || !pair.refreshToken) throw new Error("The server returned an incomplete session.");
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, pair.refreshToken);
  await SecureStore.setItemAsync(API_BASE_KEY, apiBaseUrl.trim().replace(/\/+$/, ""));
  await fetchAuthenticatedIdentity(apiBaseUrl, pair.accessToken, pair.refreshToken);
  const mfaResponse = await fetch(`${apiRoot(apiBaseUrl)}/auth/mfa/status`, { headers: { Authorization: `Bearer ${pair.accessToken}` } });
  const mfaPayload = await readJson(mfaResponse) as { data?: { policy?: MfaPolicy } };
  pair.mfaPolicy = mfaPayload.data?.policy;
  return pair;
}

export async function getMfaStatus(apiBaseUrl: string, accessToken: string): Promise<{ enrolled: boolean; policy?: MfaPolicy }> {
  const response = await fetch(`${apiRoot(apiBaseUrl)}/auth/mfa/status`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const payload = await readJson(response) as { data?: { enrolled?: boolean; policy?: MfaPolicy } };
  return { enrolled: Boolean(payload.data?.enrolled), policy: payload.data?.policy };
}

export async function verifyMfaChallenge(apiBaseUrl: string, accessToken: string, code: string): Promise<void> {
  const response = await fetch(`${apiRoot(apiBaseUrl)}/auth/mfa/verify`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ code: code.trim() }) });
  await readJson(response);
}

export async function beginMfaEnrollment(apiBaseUrl: string, accessToken: string): Promise<MfaEnrollment> {
  const response = await fetch(`${apiRoot(apiBaseUrl)}/auth/mfa/totp/enroll`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } });
  const payload = await readJson(response) as { data: MfaEnrollment };
  return payload.data;
}

export async function getStoredApiBaseUrl(): Promise<string | null> {
  return SecureStore.getItemAsync(API_BASE_KEY);
}

export async function getStoredAccountEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCOUNT_EMAIL_KEY);
}

export async function getStoredAccountId(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCOUNT_ID_KEY);
}

export async function refreshSession(apiBaseUrl: string, currentRefreshToken: string): Promise<TokenPair> {
  const tokenForLock = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY) || currentRefreshToken;
  const lockKey = refreshLockKey(apiBaseUrl, tokenForLock);
  const existing = refreshInFlight.get(lockKey);
  if (existing) return existing;
  const operation = (async () => {
    const latestRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY) || currentRefreshToken;
    const response = await fetch(`${apiRoot(apiBaseUrl)}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: latestRefreshToken })
    });
    const pair = await readJson(response) as TokenPair;
    if (!pair.accessToken || !pair.refreshToken) throw new Error("The server returned an incomplete refreshed session.");
    // Never let a refresh started for an old account overwrite a newer sign-in.
    const stillCurrent = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (stillCurrent && stillCurrent !== latestRefreshToken) {
      throw new Error("The active account changed while refreshing. Retry using the current session.");
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, pair.refreshToken);
    await SecureStore.setItemAsync(API_BASE_KEY, apiBaseUrl.trim().replace(/\/+$/, ""));
    await fetchAuthenticatedIdentity(apiBaseUrl, pair.accessToken, pair.refreshToken);
    const mfaResponse = await fetch(`${apiRoot(apiBaseUrl)}/auth/mfa/status`, { headers: { Authorization: `Bearer ${pair.accessToken}` } });
    const mfaPayload = await readJson(mfaResponse) as { data?: { policy?: MfaPolicy } };
    pair.mfaPolicy = mfaPayload.data?.policy;
    return pair;
  })();
  refreshInFlight.set(lockKey, operation);
  try { return await operation; }
  finally { if (refreshInFlight.get(lockKey) === operation) refreshInFlight.delete(lockKey); }
}

export async function restoreSession(apiBaseUrl: string): Promise<TokenPair | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;
  try {
    return await refreshSession(apiBaseUrl, refreshToken);
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error ? Number((error as { status: unknown }).status) : 0;
    const temporary = error instanceof TypeError || status >= 500 || status === 408 || status === 429;
    if (temporary) {
      // Preserve the refresh token and return an offline-only marker. The app must
      // render only its account-scoped cache until a successful reconnect.
      const latestRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY) || refreshToken;
      return { accessToken: "", refreshToken: latestRefreshToken, tokenType: "Bearer", expiresIn: 0 };
    }
    await clearSession();
    return null;
  }
}

export async function signOut(apiBaseUrl: string): Promise<void> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  try {
    if (refreshToken) {
      await fetch(`${apiRoot(apiBaseUrl)}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });
    }
  } catch {
    // Local sign-out must still complete when the device is offline.
  } finally {
    await clearSession();
  }
}

export async function clearSession(): Promise<void> {
  await Promise.all([SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY), SecureStore.deleteItemAsync(API_BASE_KEY), SecureStore.deleteItemAsync(ACCOUNT_EMAIL_KEY), SecureStore.deleteItemAsync(ACCOUNT_ID_KEY)]);
}
