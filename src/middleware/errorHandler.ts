import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { Prisma } from '@prisma/client';
import { AppError } from '@/utils/appError';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    statusCode: err.statusCode
  });

  // Prisma error mapping
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      err = new AppError('Duplicate value violates unique constraint', 409);
    } else if (err.code === 'P2025') {
      err = new AppError('Resource not found', 404);
    } else {
      err = new AppError('Database error', 400);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode || 500).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode || 500).json({
        status: err.status,
        message: err.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
};
