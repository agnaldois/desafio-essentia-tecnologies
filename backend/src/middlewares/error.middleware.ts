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

  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    statusCode,
  });
}
