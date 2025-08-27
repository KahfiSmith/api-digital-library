import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const headerId = (req.headers['x-request-id'] as string | undefined)?.trim();
  const id = headerId && headerId.length > 0 ? headerId : uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
}

