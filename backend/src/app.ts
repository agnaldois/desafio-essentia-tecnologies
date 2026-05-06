import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { config } from './config/env';
import { taskRouter } from './routes/task.routes';
import { errorMiddleware } from './middlewares/error.middleware';

export const app = express();

// ─── Middleware order is load-bearing (D-21) ──────────────────────────────────

// 1. CORS — must come first so preflight requests are handled (INFRA-02, D-21)
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);

// 2. Body parsing
app.use(express.json());

// 3. Public auth routes — placeholder for Phase 3
// app.use('/api/v1/auth', authRouter);

// 4. Auth middleware — placeholder for Phase 3
// app.use(authMiddleware);

// 5. Protected task routes
app.use('/api/v1/tasks', taskRouter);

// 6. 404 handler for unmatched routes
app.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ error: 'Not found', statusCode: 404 });
});

// 7. 4-argument error handler — must be last (D-20, D-21)
app.use(errorMiddleware);
