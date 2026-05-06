/**
 * Task controller + routes integration tests.
 *
 * Uses supertest against the Express app (no live DB) by mocking taskService.
 * Validates HTTP status codes (D-07) and envelope shapes (D-05, D-06).
 */
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { taskRouter } from '../src/routes/task.routes';
import { errorMiddleware } from '../src/middlewares/error.middleware';
import { taskService } from '../src/services/task.service';
import { TaskPriority } from '../src/entities/Task.entity';
import type { Task } from '../src/entities/Task.entity';

// Mock the entire taskService so no DB is needed
jest.mock('../src/services/task.service');

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: null,
  priority: TaskPriority.MEDIUM,
  dueDate: null,
  completed: false,
  completedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

const toggledTask: Task = { ...mockTask, completed: true, completedAt: new Date() };

function buildTestApp() {
  const app = express();
  app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
  app.use(json());
  app.use('/api/v1/tasks', taskRouter);
  app.use(errorMiddleware);
  return app;
}

describe('TaskController — HTTP contract D-07', () => {
  let app: ReturnType<typeof buildTestApp>;

  beforeEach(() => {
    app = buildTestApp();
    jest.clearAllMocks();
  });

  // ─── GET /api/v1/tasks → 200 ───────────────────────────────────────────────
  it('GET / returns 200 with { data: Task[], message }', async () => {
    (taskService.findAll as jest.Mock).mockResolvedValue([mockTask]);

    const res = await request(app).get('/api/v1/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('message');
  });

  // ─── POST /api/v1/tasks → 201 ─────────────────────────────────────────────
  it('POST / returns 201 with { data: Task, message }', async () => {
    (taskService.create as jest.Mock).mockResolvedValue(mockTask);

    const res = await request(app)
      .post('/api/v1/tasks')
      .send({ title: 'Test Task' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });

  // ─── POST /api/v1/tasks with empty body → 400 ─────────────────────────────
  it('POST / with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('statusCode', 400);
  });

  // ─── GET /api/v1/tasks/:id → 200 ──────────────────────────────────────────
  it('GET /:id returns 200 with single task envelope', async () => {
    (taskService.findOne as jest.Mock).mockResolvedValue(mockTask);

    const res = await request(app).get('/api/v1/tasks/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('message');
  });

  // ─── GET /api/v1/tasks/:id not found → 404 ────────────────────────────────
  it('GET /:id not found returns 404', async () => {
    const err = Object.assign(new Error('Task not found'), { status: 404 });
    (taskService.findOne as jest.Mock).mockRejectedValue(err);

    const res = await request(app).get('/api/v1/tasks/999999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('statusCode', 404);
  });

  // ─── PUT /api/v1/tasks/:id → 200 ──────────────────────────────────────────
  it('PUT /:id returns 200 with updated task', async () => {
    const updated = { ...mockTask, title: 'Updated Task' };
    (taskService.update as jest.Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/v1/tasks/1')
      .send({ title: 'Updated Task' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.title).toBe('Updated Task');
    expect(res.body).toHaveProperty('message');
  });

  // ─── PUT /api/v1/tasks/:id not found → 404 ────────────────────────────────
  it('PUT /:id not found returns 404', async () => {
    const err = Object.assign(new Error('Task not found'), { status: 404 });
    (taskService.update as jest.Mock).mockRejectedValue(err);

    const res = await request(app)
      .put('/api/v1/tasks/999999')
      .send({ title: 'x' });

    expect(res.status).toBe(404);
  });

  // ─── PATCH /api/v1/tasks/:id/toggle → 200 ─────────────────────────────────
  it('PATCH /:id/toggle returns 200 with toggled task', async () => {
    (taskService.toggle as jest.Mock).mockResolvedValue(toggledTask);

    const res = await request(app).patch('/api/v1/tasks/1/toggle');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.completed).toBe(true);
    expect(res.body).toHaveProperty('message');
  });

  // ─── PATCH /api/v1/tasks/:id/toggle not found → 404 ──────────────────────
  it('PATCH /:id/toggle not found returns 404', async () => {
    const err = Object.assign(new Error('Task not found'), { status: 404 });
    (taskService.toggle as jest.Mock).mockRejectedValue(err);

    const res = await request(app).patch('/api/v1/tasks/999999/toggle');

    expect(res.status).toBe(404);
  });

  // ─── DELETE /api/v1/tasks/:id → 204 ───────────────────────────────────────
  it('DELETE /:id returns 204 with empty body', async () => {
    (taskService.softDelete as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app).delete('/api/v1/tasks/1');

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });

  // ─── DELETE /api/v1/tasks/:id not found → 404 ────────────────────────────
  it('DELETE /:id not found returns 404', async () => {
    const err = Object.assign(new Error('Task not found'), { status: 404 });
    (taskService.softDelete as jest.Mock).mockRejectedValue(err);

    const res = await request(app).delete('/api/v1/tasks/999999');

    expect(res.status).toBe(404);
  });
});
