import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';

export const taskRouter = Router();

// PATCH must be declared before /:id to avoid Express matching /toggle as an id (D-07)
taskRouter.patch('/:id/toggle', (req, res, next) =>
  taskController.toggle(req, res, next),
);

taskRouter.get('/', (req, res, next) => taskController.list(req, res, next));
taskRouter.get('/:id', (req, res, next) => taskController.getById(req, res, next));

taskRouter.post('/', validateBody(CreateTaskDto), (req, res, next) =>
  taskController.create(req, res, next),
);

taskRouter.put('/:id', validateBody(UpdateTaskDto), (req, res, next) =>
  taskController.update(req, res, next),
);

taskRouter.delete('/:id', (req, res, next) =>
  taskController.remove(req, res, next),
);
