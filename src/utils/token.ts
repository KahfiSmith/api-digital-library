import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const ACCESS_SECRET: Secret = (process.env.JWT_SECRET || '') as Secret;
const REFRESH_SECRET: Secret = (process.env.JWT_REFRESH_SECRET || '') as Secret;
const ACCESS_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
const REFRESH_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as SignOptions['expiresIn'];

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  jti: string; // token id stored in DB for rotation
}

export function signAccessToken(payload: AccessTokenPayload): string {
  if (!ACCESS_SECRET) throw new Error('JWT_SECRET not configured');
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN } as SignOptions);
}

export function signRefreshToken(userId: string, jti?: string): { token: string; jti: string; expiresAt: Date } {
  if (!REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET not configured');
  const id = jti || uuidv4();
  const token = jwt.sign({ userId, jti: id } as RefreshTokenPayload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN } as SignOptions);
  // derive expiresAt from REFRESH_EXPIRES_IN (rough estimate; server trust JWT exp for enforcement, DB for rotation)
  const now = new Date();
  let ms = 30 * 24 * 60 * 60 * 1000; // default 30d
  const rexp = String(REFRESH_EXPIRES_IN);
  const m = /^([0-9]+)([smhdw])$/.exec(rexp);
  if (m) {
    const val = parseInt(String(m[1]), 10);
    const unit = String(m[2]);
    const mult = unit === 's' ? 1000 : unit === 'm' ? 60000 : unit === 'h' ? 3600000 : unit === 'd' ? 86400000 : 604800000;
    ms = val * mult;
  }
  const expiresAt = new Date(now.getTime() + ms);
  return { token, jti: id, expiresAt };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  if (!ACCESS_SECRET) throw new Error('JWT_SECRET not configured');
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  if (!REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET not configured');
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}
