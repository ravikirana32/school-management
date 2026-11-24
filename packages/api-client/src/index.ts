export type ApiClientOptions = {
  baseUrl: string;
  getAccessToken?: () => string | undefined;
};

export function createApiClient(options: ApiClientOptions) {
  return {
    async get<T>(path: string): Promise<T> {
      const token = options.getAccessToken?.();
      const response = await fetch(`${options.baseUrl}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      return response.json() as Promise<T>;
    },
  };
}
