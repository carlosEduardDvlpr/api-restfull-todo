import { UserController } from '@/controllers/users.controller';
import { Router } from 'express';

const usersRoutes = Router();
const userController = new UserController();

usersRoutes.get('/login', userController.index);
usersRoutes.post('/create', userController.create);
usersRoutes.delete('/delete/:id', userController.delete);

export { usersRoutes };
