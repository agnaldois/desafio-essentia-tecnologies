import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error & { status?: number; statusCode?: number },
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
  res.status(statusCode).json({
    error: isClientError ? err.message : 'Internal server error',
    statusCode,
  });
}
