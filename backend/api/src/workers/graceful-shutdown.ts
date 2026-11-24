export type WorkerShutdownDependencies = {
  closeWorker: () => Promise<unknown>;
  closeQueues: () => Promise<unknown>;
  disconnectDatabase: () => Promise<unknown>;
  clearTimers: () => void;
  /** Maximum time allowed for each asynchronous drain/close step. Defaults to 10s. */
  stepTimeoutMs?: number;
};

/**
 * Idempotent bounded shutdown.
 * Stops scheduling first, then attempts every cleanup step even if a prior step
 * fails or times out. Errors are surfaced together so supervisors can alert.
 */
export function createWorkerShutdown(dependencies: WorkerShutdownDependencies) {
  let shutdownPromise: Promise<void> | undefined;
  const timeoutMs = dependencies.stepTimeoutMs ?? 10_000;

  async function boundedStep(name: string, operation: () => Promise<unknown>) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`${name} timed out after ${timeoutMs}ms`)), timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  return () => {
    if (shutdownPromise) return shutdownPromise;
    shutdownPromise = (async () => {
      const errors: Error[] = [];
      try { dependencies.clearTimers(); }
      catch (error) { errors.push(error instanceof Error ? error : new Error(String(error))); }

      for (const [name, operation] of [
        ["worker drain", dependencies.closeWorker],
        ["queue close", dependencies.closeQueues],
        ["database disconnect", dependencies.disconnectDatabase],
      ] as const) {
        try { await boundedStep(name, operation); }
        catch (error) { errors.push(error instanceof Error ? error : new Error(String(error))); }
      }

      if (errors.length) throw new AggregateError(errors, "Worker shutdown completed with cleanup errors");
    })();
    return shutdownPromise;
  };
}
