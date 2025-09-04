import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { Prisma } from '@prisma/client';
import { AppError } from '@/utils/appError';
import { ResponseUtil } from '@/utils/response';

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
  // Safety check to prevent response already sent errors
  if (res.headersSent) {
    return next(err);
  }

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
      const customError = err as CustomError;
      customError.message = 'Duplicate value violates unique constraint';
      customError.statusCode = 409;
      customError.status = 'fail';
    } else if (err.code === 'P2025') {
      const customError = err as CustomError;
      customError.message = 'Resource not found';
      customError.statusCode = 404;
      customError.status = 'fail';
    } else {
      const customError = err as CustomError;
      customError.message = 'Database operation failed';
      customError.statusCode = 400;
      customError.status = 'fail';
    }
  }

  // Handle other Prisma errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    const customError = err as CustomError;
    customError.message = 'Invalid data provided';
    customError.statusCode = 400;
    customError.status = 'fail';
  }

  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    const customError = err as CustomError;
    customError.message = 'Database connection error';
    customError.statusCode = 500;
    customError.status = 'error';
  }

  // Standardized error response
  const includeStack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
  const message = err.isOperational ? err.message : 'Something went wrong!';
  const statusCode = err.isOperational ? (err.statusCode || 500) : 500;
  ResponseUtil.error(res, message, statusCode, includeStack);
};
