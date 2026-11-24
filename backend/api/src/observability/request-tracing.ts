import { randomBytes, randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export type RequestTraceContext = {
  requestId: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sampled: boolean;
};

declare global {
  namespace Express {
    interface Request {
      traceContext?: RequestTraceContext;
    }
  }
}

const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/i;
const REQUEST_ID = /^[a-zA-Z0-9._:-]{1,128}$/;

export function requestTracingMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingRequestId = req.header("x-request-id") || "";
  const requestId = REQUEST_ID.test(incomingRequestId) ? incomingRequestId : randomUUID();
  const incomingTrace = TRACEPARENT.exec(req.header("traceparent") || "");
  const traceId = incomingTrace?.[1]?.toLowerCase() || randomBytes(16).toString("hex");
  const parentSpanId = incomingTrace?.[2]?.toLowerCase();
  const flags = incomingTrace?.[3]?.toLowerCase() || "00";
  const spanId = randomBytes(8).toString("hex");
  const context: RequestTraceContext = {
    requestId,
    traceId,
    spanId,
    ...(parentSpanId ? { parentSpanId } : {}),
    sampled: (parseInt(flags, 16) & 1) === 1,
  };
  req.traceContext = context;
  req.headers["x-request-id"] = requestId;
  req.headers.traceparent = `00-${traceId}-${spanId}-${flags}`;
  res.setHeader("X-Request-ID", requestId);
  res.setHeader("traceparent", req.headers.traceparent);
  next();
}
