import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/env';

// Declaration merging — extends Express.Request globally so req.user is typed
// throughout all controllers without casting (Pitfall 3 prevention).
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string };
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(Object.assign(new Error('Missing or invalid Authorization header'), { status: 401 }));
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256'],   // CLAUDE.md: explicit algorithm whitelist prevents alg:none attack
    }) as JwtPayload;
    req.user = { id: decoded['id'] as number, email: decoded['email'] as string };
    next();
  } catch {
    next(Object.assign(new Error('Invalid or expired token'), { status: 401 }));
  }
}
