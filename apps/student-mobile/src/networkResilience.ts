/** Safe transient-network retry helpers for student mobile read operations. */
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const MAX_GET_RETRIES = 2;

export async function fetchWithReadRetry(fetcher: (attempt: number) => Promise<Response>, retries = MAX_GET_RETRIES): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetcher(attempt);
      if (!RETRYABLE_STATUS.has(response.status) || attempt === retries) return response;
      lastError = new Error(`Transient request status ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === retries || !(error instanceof TypeError)) throw error;
    }
    await new Promise(resolve => setTimeout(resolve, Math.min(250 * (2 ** attempt), 1000)));
  }
  throw lastError instanceof Error ? lastError : new Error('Network request failed');
}


export function isOfflineSession(pair: { accessToken?: string | null } | null | undefined): boolean {
  return Boolean(pair && !pair.accessToken);
}
