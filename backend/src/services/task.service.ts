import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { Task } from '../entities/Task.entity';
import { TaskMetadataModel, ActivityLogEntry } from '../models/task-metadata.model';

type TaskWithLog = Task & { activityLog: ActivityLogEntry[] };

function notFound(): Error {
  return Object.assign(new Error('Task not found'), { status: 404 });
}

function forbidden(): Error {
  return Object.assign(new Error('Forbidden'), { status: 403 });
}

async function pushLog(taskId: number, action: ActivityLogEntry['action'], detail: string): Promise<void> {
  await TaskMetadataModel.findOneAndUpdate(
    { taskId },
    { $push: { activityLog: { action, timestamp: new Date(), detail } } },
    { upsert: true, new: true },
  );
}

async function fetchLog(taskId: number): Promise<ActivityLogEntry[]> {
  const meta = await TaskMetadataModel.findOne({ taskId }).lean();
  return meta?.activityLog ?? [];
}

export class TaskService {
  async findAll(userId: number): Promise<TaskWithLog[]> {
    const tasks = await TaskRepository.findAllByUserId(userId);
    try {
      const ids = tasks.map(t => t.id);
      const metas = await TaskMetadataModel.find({ taskId: { $in: ids } }).lean();
      const metaMap = new Map(metas.map(m => [m.taskId, m.activityLog ?? []]));
      return tasks.map(task => ({ ...task, activityLog: metaMap.get(task.id) ?? [] }));
    } catch {
      // D-06: MongoDB unavailable — graceful degradation, return tasks with empty activityLog
      return tasks.map(task => ({ ...task, activityLog: [] }));
    }
  }

  async findOne(id: number, userId: number): Promise<TaskWithLog> {
    const task = await TaskRepository.findById(id);
    if (!task) throw notFound();
    if (task.userId !== userId) throw forbidden();
    try {
      const activityLog = await fetchLog(id);
      return { ...task, activityLog };
    } catch {
      return { ...task, activityLog: [] };
    }
  }

  async create(dto: CreateTaskDto, userId: number): Promise<TaskWithLog> {
    const task = TaskRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      userId,
    });
    const saved = await TaskRepository.save(task);

    // Compensating transaction: only roll back if the log WRITE fails.
    try {
      await pushLog(saved.id, 'created', saved.title);
    } catch {
      try {
        await TaskRepository.softDelete(saved.id);
      } catch (rollbackErr) {
        console.error('[TaskService] Compensating rollback failed; orphaned taskId:', saved.id, rollbackErr);
      }
      throw Object.assign(
        new Error('Failed to write activity log; task creation rolled back'),
        { status: 503 },
      );
    }

    // Fetching the log for the response is best-effort — failure is non-fatal.
    let activityLog: ActivityLogEntry[] = [];
    try {
      activityLog = await fetchLog(saved.id);
    } catch { /* MongoDB read unavailable — degrade gracefully */ }

    return { ...saved, activityLog };
  }

  async update(id: number, dto: UpdateTaskDto, userId: number): Promise<TaskWithLog> {
    const task = await TaskRepository.findById(id);
    if (!task) throw notFound();
    if (task.userId !== userId) throw forbidden();
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    if (dto.completed !== undefined) {
      const wasCompleted = task.completed;
      task.completed = dto.completed;
      if (dto.completed && !wasCompleted) { task.completedAt = new Date(); }
      else if (!dto.completed) { task.completedAt = null; }
    }
    const saved = await TaskRepository.save(task);
    try {
      await pushLog(saved.id, 'updated', saved.title);
      const activityLog = await fetchLog(saved.id);
      return { ...saved, activityLog };
    } catch {
      return { ...saved, activityLog: [] };
    }
  }

  async toggle(id: number, userId: number): Promise<TaskWithLog> {
    const task = await TaskRepository.findById(id);
    if (!task) throw notFound();
    if (task.userId !== userId) throw forbidden();
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    const saved = await TaskRepository.save(task);
    try {
      await pushLog(saved.id, 'toggled', saved.title);
      const activityLog = await fetchLog(saved.id);
      return { ...saved, activityLog };
    } catch {
      return { ...saved, activityLog: [] };
    }
  }

  async softDelete(id: number, userId: number): Promise<void> {
    const task = await TaskRepository.findById(id);
    if (!task) throw notFound();
    if (task.userId !== userId) throw forbidden();
    // Write MongoDB log BEFORE soft-delete so the entry persists after deletion (Pitfall 5)
    try {
      await pushLog(id, 'deleted', task.title);
    } catch {
      // MongoDB log failure on delete is non-fatal: proceed with delete anyway
    }
    await TaskRepository.softDelete(id);
  }
}

export const taskService = new TaskService();
