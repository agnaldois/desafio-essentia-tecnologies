/**
 * Development seed — populates the database with a representative dataset.
 *
 * Decisions satisfied:
 *   D-12 — 5-10 tasks with varied titles, priorities, due dates, completion states
 *   D-13 — idempotent: clears the tasks table before inserting so re-running
 *           always produces the same clean state
 *   D-14 — executed via `ts-node src/seeds/seed.ts`
 *
 * STRIDE T-01-07-01: repo.clear() before save guarantees idempotency.
 * STRIDE T-01-07-02: AppDataSource.destroy() in finally guarantees clean exit.
 */

import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';
import { Task, TaskPriority } from '../entities/Task.entity';

const now = new Date();

/** Past date helper — n days ago */
function daysAgo(n: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
}

/** Future date helper — n days from now */
function daysFromNow(n: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d;
}

/**
 * Deterministic dataset exported for unit-testability (D-13 structural check).
 * Each entry maps exactly to Task entity fields (minus auto-managed columns).
 */
export const SEED_TASKS: Partial<Task>[] = [
  // ── High priority — overdue, completed ──────────────────────────────────
  {
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    priority: TaskPriority.HIGH,
    dueDate: daysAgo(5),
    completed: true,
    completedAt: daysAgo(2),
  },

  // ── High priority — overdue, incomplete ─────────────────────────────────
  {
    title: 'Fix authentication bug in production',
    description: 'Users are being logged out unexpectedly after token refresh',
    priority: TaskPriority.HIGH,
    dueDate: daysAgo(3),
    completed: false,
    completedAt: null,
  },

  // ── High priority — future due date, incomplete ──────────────────────────
  {
    title: 'Implement rate limiting on API endpoints',
    description: 'Protect public endpoints from abuse with express-rate-limit',
    priority: TaskPriority.HIGH,
    dueDate: daysFromNow(7),
    completed: false,
    completedAt: null,
  },

  // ── Medium priority — overdue, completed ────────────────────────────────
  {
    title: 'Write unit tests for task service',
    description: null,
    priority: TaskPriority.MEDIUM,
    dueDate: daysAgo(10),
    completed: true,
    completedAt: daysAgo(8),
  },

  // ── Medium priority — future due date, incomplete ───────────────────────
  {
    title: 'Add pagination to task list endpoint',
    description: 'Support ?page=1&limit=20 query parameters for GET /tasks',
    priority: TaskPriority.MEDIUM,
    dueDate: daysFromNow(14),
    completed: false,
    completedAt: null,
  },

  // ── Medium priority — no due date, incomplete ───────────────────────────
  {
    title: 'Refactor error handling middleware',
    description: 'Consolidate error codes into a shared constants file',
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    completed: false,
    completedAt: null,
  },

  // ── Low priority — future due date, completed ───────────────────────────
  {
    title: 'Update project README',
    description: 'Add setup instructions, environment variables table and API docs',
    priority: TaskPriority.LOW,
    dueDate: daysFromNow(30),
    completed: true,
    completedAt: daysAgo(1),
  },

  // ── Low priority — no due date, incomplete ──────────────────────────────
  {
    title: 'Explore Angular 21 signal-based state management',
    description: null,
    priority: TaskPriority.LOW,
    dueDate: null,
    completed: false,
    completedAt: null,
  },
];

async function runSeed(): Promise<void> {
  // WR-03: refuse to run in production — repo.clear() truncates all tasks
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed must not be run in production. Aborting.');
  }
  await AppDataSource.initialize();
  try {
    const repo = AppDataSource.getRepository(Task);

    // D-13: clear existing data before inserting to ensure idempotency
    await repo.clear();

    await repo.save(repo.create(SEED_TASKS as Task[]));

    const count = await repo.count();
    console.log(`Seed complete — ${count} tasks inserted.`);
  } finally {
    // T-01-07-02: always destroy the connection so the process exits cleanly
    await AppDataSource.destroy();
  }
}

// Only run when executed directly (not when imported in tests)
if (require.main === module) {
  runSeed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
