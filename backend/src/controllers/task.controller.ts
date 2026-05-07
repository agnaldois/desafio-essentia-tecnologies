import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { parseId } from './utils';

/**
 * Thin HTTP controller — delegates all business logic to TaskService (D-15).
 * Applies success envelope { data, message } per D-05.
 * Status codes strictly follow D-07.
 * Express 5 propagates async errors natively — no asyncHandler needed (D-20).
 * req.user is guaranteed populated by authMiddleware for all these routes.
 */
export class TaskController {
  async list(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const tasks = await taskService.findAll(req.user!.id);
    res.status(200).json({ data: tasks, message: 'Tasks retrieved successfully' });
  }

  async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = parseId(req.params.id);
    const task = await taskService.findOne(id, req.user!.id);
    res.status(200).json({ data: task, message: 'Task retrieved successfully' });
  }

  async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const task = await taskService.create(req.body, req.user!.id);
    res.status(201).json({ data: task, message: 'Task created successfully' });
  }

  async update(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = parseId(req.params.id);
    const task = await taskService.update(id, req.body, req.user!.id);
    res.status(200).json({ data: task, message: 'Task updated successfully' });
  }

  async toggle(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = parseId(req.params.id);
    const task = await taskService.toggle(id, req.user!.id);
    res.status(200).json({ data: task, message: 'Task toggled successfully' });
  }

  async remove(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = parseId(req.params.id);
    await taskService.softDelete(id, req.user!.id);
    res.status(204).send();
  }
}

export const taskController = new TaskController();
