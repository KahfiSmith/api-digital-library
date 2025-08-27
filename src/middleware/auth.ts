import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types';
import { COOKIE_NAMES, getCookie } from '@/utils/cookies';

const JWT_SECRET = process.env.JWT_SECRET || '';

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization || '';
    let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      // Fallback to access token cookie
      token = getCookie(req, COOKIE_NAMES.access);
    }

    if (!token) {
      res.status(401).json({ status: 'error', message: 'Unauthorized: missing token' });
      return;
    }

    if (!JWT_SECRET) {
      res.status(500).json({ status: 'error', message: 'Server misconfigured: JWT_SECRET not set' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Unauthorized: invalid token' });
  }
}

export function requireRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      res.status(403).json({ status: 'error', message: 'Forbidden: insufficient privileges' });
      return;
    }
    next();
  };
}
