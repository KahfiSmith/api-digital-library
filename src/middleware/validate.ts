import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ResponseUtil } from '@/utils/response';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    ResponseUtil.error(res, 'Validation failed', 422, undefined, errors.array());
    return;
  }
  next();
}
