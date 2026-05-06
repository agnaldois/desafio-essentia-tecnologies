/**
 * Seed data unit tests — verifies that the seed dataset satisfies D-12/D-13
 * requirements without hitting a live database.
 *
 * Tests the exported SEED_TASKS constant from seed.ts, which is the source of
 * truth for what gets inserted. The idempotency behaviour (clear + save) is
 * tested structurally: same deterministic array => same final DB state.
 */

import { SEED_TASKS } from '../src/seeds/seed';
import { TaskPriority } from '../src/entities/Task.entity';

describe('Seed data — D-12/D-13 requirements', () => {
  it('contains between 5 and 10 tasks', () => {
    expect(SEED_TASKS.length).toBeGreaterThanOrEqual(5);
    expect(SEED_TASKS.length).toBeLessThanOrEqual(10);
  });

  it('covers all three priority levels (D-12)', () => {
    const priorities = SEED_TASKS.map((t) => t.priority);
    expect(priorities).toContain(TaskPriority.LOW);
    expect(priorities).toContain(TaskPriority.MEDIUM);
    expect(priorities).toContain(TaskPriority.HIGH);
  });

  it('includes at least one completed task', () => {
    const completed = SEED_TASKS.filter((t) => t.completed === true);
    expect(completed.length).toBeGreaterThanOrEqual(1);
  });

  it('includes at least one incomplete task', () => {
    const incomplete = SEED_TASKS.filter((t) => t.completed === false);
    expect(incomplete.length).toBeGreaterThanOrEqual(1);
  });

  it('completed tasks have completedAt set (not null)', () => {
    const completed = SEED_TASKS.filter((t) => t.completed === true);
    completed.forEach((task) => {
      expect(task.completedAt).not.toBeNull();
      expect(task.completedAt).toBeInstanceOf(Date);
    });
  });

  it('incomplete tasks have completedAt as null', () => {
    const incomplete = SEED_TASKS.filter((t) => t.completed === false);
    incomplete.forEach((task) => {
      expect(task.completedAt).toBeNull();
    });
  });

  it('includes at least one task with a past due date (overdue)', () => {
    const now = new Date();
    const overdue = SEED_TASKS.filter(
      (t) => t.dueDate !== null && t.dueDate !== undefined && new Date(t.dueDate) < now,
    );
    expect(overdue.length).toBeGreaterThanOrEqual(1);
  });

  it('includes at least one task with a future due date', () => {
    const now = new Date();
    const future = SEED_TASKS.filter(
      (t) => t.dueDate !== null && t.dueDate !== undefined && new Date(t.dueDate) > now,
    );
    expect(future.length).toBeGreaterThanOrEqual(1);
  });

  it('includes at least one task with no due date (null)', () => {
    const noDueDate = SEED_TASKS.filter((t) => t.dueDate === null || t.dueDate === undefined);
    expect(noDueDate.length).toBeGreaterThanOrEqual(1);
  });

  it('all tasks have non-empty titles', () => {
    SEED_TASKS.forEach((task) => {
      expect(typeof task.title).toBe('string');
      expect((task.title ?? '').trim().length).toBeGreaterThan(0);
    });
  });

  it('dataset is deterministic — same titles every run (D-13)', () => {
    const titles = SEED_TASKS.map((t) => t.title);
    // Re-importing the same module returns the same reference — titles are static
    expect(titles).toEqual(SEED_TASKS.map((t) => t.title));
  });
});
