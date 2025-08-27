export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${String(statusCode).startsWith('4') ? 'fail' : 'error'}`;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message = 'Bad request'): AppError {
    return new AppError(message, 400);
  }
  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, 401);
  }
  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 403);
  }
  static notFound(message = 'Not found'): AppError {
    return new AppError(message, 404);
  }
}

