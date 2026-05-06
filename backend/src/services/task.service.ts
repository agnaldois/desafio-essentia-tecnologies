import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { Task } from '../entities/Task.entity';

function notFound(): Error {
  return Object.assign(new Error('Task not found'), { status: 404 });
}

export class TaskService {
  async findAll(): Promise<Task[]> {
    return TaskRepository.findAll();
  }

  async findOne(id: number): Promise<Task> {
    const task = await TaskRepository.findById(id);
    if (!task) throw notFound();
    return task;
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const task = TaskRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    });
    return TaskRepository.save(task);
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    if (dto.completed !== undefined) {
      const wasCompleted = task.completed;
      task.completed = dto.completed;
      // Stamp completedAt only on the false→true transition (WR-02).
      // If the task was already completed, leave the original timestamp unchanged.
      // toggle() uses the same new Date() convention for its own transition.
      if (dto.completed && !wasCompleted) {
        task.completedAt = new Date();
      } else if (!dto.completed) {
        task.completedAt = null;
      }
    }
    return TaskRepository.save(task);
  }

  async toggle(id: number): Promise<Task> {
    const task = await this.findOne(id);
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    return TaskRepository.save(task);
  }

  async softDelete(id: number): Promise<void> {
    await this.findOne(id);
    await TaskRepository.softDelete(id);
  }
}

export const taskService = new TaskService();
