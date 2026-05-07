import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { taskRouter } from './routes/task.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { authRouter } from './routes/auth.routes';
import { authMiddleware } from './middlewares/auth.middleware';

export const app = express();

// ─── Middleware order is load-bearing (D-21) ──────────────────────────────────

// 1. Security headers — helmet sets X-Content-Type-Options, X-Frame-Options,
//    Strict-Transport-Security, CSP, etc. (CR-01)
app.use(helmet());

// 2. HTTP request logging
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// 3. CORS — preflight requests handled before body parsing (INFRA-02, D-21)
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);

// 4. Body parsing
app.use(express.json());

// 5. Public auth routes — registered BEFORE authMiddleware (CLAUDE.md load-bearing order)
app.use('/api/v1/auth', authRouter);

// 6. Auth middleware — protects ALL routes registered after this line
// NOTE: any future public routes must be registered ABOVE this line
app.use(authMiddleware);

// 7. Protected task routes
app.use('/api/v1/tasks', taskRouter);

// 8. 404 handler for unmatched routes
app.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ error: 'Not found', statusCode: 404 });
});

// 9. 4-argument error handler — must be last (D-20, D-21)
app.use(errorMiddleware);
