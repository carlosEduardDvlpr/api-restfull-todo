import { db } from '@/infra';
import { tasksSchema, usersSchema } from '@/infra/schema';
import { AppError } from '@/utils/app-error';
import { eq, sql } from 'drizzle-orm';
import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  string as zodString,
  object as zodObject,
  number as zodNumber,
  enum as zodEnum,
} from 'zod';

const bodySchemaCreate = zodObject(
  {
    title: zodString('Título inválido ou não encontrado!')
      .min(5, 'O título deve ter pelo menos 5 caracteres!')
      .max(60, 'O título excede o limite de caracteres!')
      .nonempty('O título é obrigatório!'),
    description: zodString('Descrição inválida ou não encontrada!')
      .min(10, 'A descrição deve ter pelo menos 10 caracteres!')
      .max(255, 'A descrição excede o limite de caracteres!')
      .nonempty('A descrição é obrigatória!'),
  },
  'Os campos de titulo e descrição são obrigatórios!',
);

const bodySchemaEdit = zodObject(
  {
    id: zodNumber("ID da tarefa inválido ou não encontrado!").nonnegative('O id não pode ser um número negativo!'),
    status: zodEnum(['TODO', 'DONE']).optional(),
    title: zodString('Título inválido ou não encontrado!')
      .min(5, 'O título deve ter pelo menos 5 caracteres!')
      .max(60, 'O título excede o limite de caracteres!')
      .optional(),
    description: zodString('Descrição inválida ou não encontrada!')
      .min(10, 'A descrição deve ter pelo menos 10 caracteres!')
      .max(255, 'A descrição excede o limite de caracteres!')
      .optional(),
  },
  'ID da tarefa é obrigatório!',
);

class TasksController {
  async index(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AppError('Authorization não encontrada!', 400);
    }

    const decrypted = jwt.verify(
      authorization,
      process.env.JWT_SECRET as string,
    ) as { id: number };

    if (!decrypted) {
      throw new AppError('Authorization inválida!', 401);
    }

    const tasks = await db
      .select({
        id: tasksSchema.id,
        title: tasksSchema.title,
        description: tasksSchema.description,
        status: tasksSchema.status,
        created_at: tasksSchema.created_at,
        updated_at: tasksSchema.updated_at,
      })
      .from(tasksSchema)
      .where(eq(tasksSchema.user_id, decrypted.id));

    return res.json({ message: 'Tasks encontradas!', tasks });
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const { title, description } = bodySchemaCreate.parse(req.body);
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AppError('Authorization não encontrada!', 400);
    }

    const decrypted = jwt.verify(
      authorization,
      process.env.JWT_SECRET as string,
    ) as { id: number };

    if (!decrypted) {
      throw new AppError('Authorization inválida!', 401);
    }

    const userExists = db
      .select({
        id: usersSchema.id,
      })
      .from(usersSchema)
      .where(eq(usersSchema.id, decrypted.id))
      .get();

    if (!userExists) {
      throw new AppError('Usuário inválido!', 401);
    }

    await db.insert(tasksSchema).values({
      title,
      description,
      user_id: decrypted.id,
      status: 'TODO',
    });

    return res.json({ message: 'Tarefa criada!' });
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { id, status, title, description } = bodySchemaEdit.parse(req.body);
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AppError('Authorization não encontrada!', 400);
    }

    const decrypted = jwt.verify(
      authorization,
      process.env.JWT_SECRET as string,
    ) as { id: number };

    if (!decrypted) {
      throw new AppError('Authorization inválida!', 401);
    }

    const task = await db
      .update(tasksSchema)
      .set({
        status,
        title,
        description,
        updated_at: new Date().toLocaleString('pt-br', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      })
      .where(
        sql`${tasksSchema.id} = ${id} and ${tasksSchema.user_id} = ${decrypted.id}`,
      );

    if (!task.changes) {
      throw new AppError('Tarefa não encontrada!', 404);
    }

    return res.json({ message: 'Dados da tarefa atualizados!' });
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body;
    const { authorization } = req.headers;

    if (!id) {
      throw new AppError('ID da tarefa é obrigatório!', 400);
    }

    if (!authorization) {
      throw new AppError('Authorization não encontrada!', 400);
    }

    const decrypted = jwt.verify(
      authorization,
      process.env.JWT_SECRET as string,
    ) as { id: number };

    if (!decrypted) {
      throw new AppError('Authorization inválida!', 401);
    }

    const task = await db
      .delete(tasksSchema)
      .where(
        sql`${tasksSchema.id} = ${id} and ${tasksSchema.user_id} = ${decrypted.id}`,
      );

    if (!task.changes) {
      throw new AppError('Tarefa não encontrada!', 404);
    }

    return res.json({ message: 'Tarefa deletada!' });
  }
}

export { TasksController };
