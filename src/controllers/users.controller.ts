import { db } from '@/infra';
import { tasksSchema, usersSchema } from '@/infra/schema';
import { AppError } from '@/utils/app-error';
import { jwtGenerator } from '@/utils/jwt-generator';
import { eq, sql } from 'drizzle-orm';
import { type Request, type Response, type NextFunction } from 'express';
import {
  email as zodEmail,
  string as zodString,
  object as zodObject,
} from 'zod';
import jwt from 'jsonwebtoken';

const bodySchema = zodObject(
  {
    email: zodEmail('E-mail inválido')
      .min(5, "O e-mail deve ter pelo menos 5 caracteres!")
      .max(255, 'O e-mail excede o limite de caracteres!')
      .nonempty('O e-mail é obrigatório!'),
    password: zodString('Senha inválida!')
      .min(5, "A senha deve ter pelo menos 5 caracteres!")
      .max(255, 'A senha excede o limite de caracteres!')
      .nonempty('A senha é obrigatória!'),
  },
  { message: 'Os campos de e-mail e senha são obrigatórios!' },
);

class UserController {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = bodySchema.parse(req.body);

      const user = db
        .select({
          id: usersSchema.id,
        })
        .from(usersSchema)
        .where(
          sql`${usersSchema.email} = ${email} and ${usersSchema.password} = ${password}`,
        )
        .get();

      if (!user) {
        throw new AppError('User não encontrado!', 404);
      }

      return res.json({ message: 'Usuário encontrado!', token: jwtGenerator(user.id) });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = bodySchema.parse(req.body);

      const userExists = db
        .select({
          id: usersSchema.id,
        })
        .from(usersSchema)
        .where(eq(usersSchema.email, email))
        .get();

      if (userExists) {
        throw new AppError('Usuário já cadastrado com esse e-mail!', 400);
      }

      const user = await db.insert(usersSchema).values({ email, password });

      if (!user.changes) {
        throw new AppError('Erro ao criar o usuário!', 500);
      }

      return res.json({ message: 'Usuário criado!' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
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

      if (!id) {
        throw new AppError('ID do usuário é obrigatório!', 400);
      }

      if (decrypted.id !== +id) {
        throw new AppError('Usuário inválido!', 401);
      }

      const userExists = db
        .select({
          id: usersSchema.id,
        })
        .from(usersSchema)
        .where(eq(usersSchema.id, +id))
        .get();

      if (!userExists) {
        throw new AppError(`Usuário inválido!`, 404);
      }

      await db.delete(tasksSchema).where(eq(tasksSchema.user_id, +id));
      const user = await db.delete(usersSchema).where(eq(usersSchema.id, +id));

      if (!user.changes) {
        throw new AppError('Error deleting user', 500);
      }

      return res.json({ message: 'Usuário deletado!' });
    } catch (error) {
      next(error);
    }
  }
}

export { UserController };
