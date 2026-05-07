import { AppDataSource } from '../config/data-source';
import { Task } from '../entities/Task.entity';

export const TaskRepository = AppDataSource.getRepository(Task).extend({
  findAll(): Promise<Task[]> {
    return this.find({ order: { createdAt: 'DESC' } });
  },
  findById(id: number): Promise<Task | null> {
    return this.findOneBy({ id });
  },
  findAllByUserId(userId: number): Promise<Task[]> {
    return this.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  },
});
