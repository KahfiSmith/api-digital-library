import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '@/utils/response';

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  ResponseUtil.error(res, `Route ${req.originalUrl} not found`, 404);
};
