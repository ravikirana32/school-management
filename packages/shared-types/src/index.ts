export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: { requestId?: string };
};

export type ApiFailure = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type HealthStatus = {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
};
