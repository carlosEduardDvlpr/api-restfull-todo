import { treeifyError as zodTreeifyError, ZodError } from 'zod';
import { type Response, type Request, type NextFunction } from 'express';
import { AppError } from '@/utils/app-error';
import { JsonWebTokenError } from 'jsonwebtoken';

export function errorHandling(
  error: any,
  req: Request,
  res: Response,
  _: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return res
      .status(400)
      .json({
        message: 'Erro na validação dos campos',
        issues: zodTreeifyError(error),
      });
  }

  if (error instanceof JsonWebTokenError) {
    return res.status(500).json({ message: 'Authorization inválida!' });
  }

  return res.status(500).json({ message: error.message });
}
