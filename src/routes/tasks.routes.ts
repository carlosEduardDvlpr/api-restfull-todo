import { TasksController } from '@/controllers/tasks.controller';
import { Router } from 'express';

const tasksRoutes = Router();
const tasksController = new TasksController();

tasksRoutes.get('/list', tasksController.index);
tasksRoutes.post('/create', tasksController.create);
tasksRoutes.patch('/edit', tasksController.update);
tasksRoutes.delete('/delete', tasksController.delete);

export { tasksRoutes };
