import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';

/**
 * Thin HTTP controller — delegates all business logic to TaskService (D-15).
 * Applies success envelope { data, message } per D-05.
 * Status codes strictly follow D-07.
 * Express 5 propagates async errors natively — no asyncHandler needed (D-20).
 */
export class TaskController {
  async list(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    const tasks = await taskService.findAll();
    res.status(200).json({ data: tasks, message: 'Tasks retrieved successfully' });
  }

  async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    const task = await taskService.findOne(id);
    res.status(200).json({ data: task, message: 'Task retrieved successfully' });
  }

  async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const task = await taskService.create(req.body);
    res.status(201).json({ data: task, message: 'Task created successfully' });
  }

  async update(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    const task = await taskService.update(id, req.body);
    res.status(200).json({ data: task, message: 'Task updated successfully' });
  }

  async toggle(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    const task = await taskService.toggle(id);
    res.status(200).json({ data: task, message: 'Task toggled successfully' });
  }

  async remove(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    await taskService.softDelete(id);
    res.status(204).send();
  }
}

export const taskController = new TaskController();
