import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error & { status?: number; statusCode?: number; details?: string[][] },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.status ?? err.statusCode ?? 500;

  // Server-side log only — never sent to the client (D-06)
  console.error(err.stack);

  // Only echo err.message for intentional 4xx client errors (CR-04).
  // 5xx responses must never expose internal details (DB hosts, stack hints).
  const isClientError = statusCode >= 400 && statusCode < 500;

  // WR-05: include 'details' if the error carries validation constraint info
  // (set by validateBody middleware) so all errors share one response shape.
  const body: Record<string, unknown> = {
    error: isClientError ? err.message : 'Internal server error',
    statusCode,
  };
  if (err.details !== undefined) {
    body.details = err.details;
  }

  res.status(statusCode).json(body);
}
