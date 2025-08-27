import { Request, Response } from 'express';

function parseDurationToMs(value: string | undefined, fallbackMs: number): number {
  const v = String(value || '');
  const m = /^([0-9]+)([smhdw])$/.exec(v);
  if (!m) return fallbackMs;
  const n = parseInt(String(m[1]), 10);
  const unit = String(m[2]);
  const mult = unit === 's' ? 1000 : unit === 'm' ? 60000 : unit === 'h' ? 3600000 : unit === 'd' ? 86400000 : 604800000;
  return n * mult;
}

const isProd = process.env.NODE_ENV === 'production';
const ACCESS_COOKIE_NAME = process.env.ACCESS_TOKEN_COOKIE_NAME || 'access_token';
const REFRESH_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || 'refresh_token';

const accessMaxAge = parseDurationToMs(process.env.JWT_EXPIRES_IN || '15m', 15 * 60 * 1000);
const refreshMaxAge = parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN || '30d', 30 * 24 * 60 * 60 * 1000);

export function setAuthCookies(res: Response, accessToken: string, refreshToken?: string): void {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: accessMaxAge,
    path: '/',
  });

  if (refreshToken) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: refreshMaxAge,
      path: '/',
    });
  }
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE_NAME, { path: '/' });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
}

export function getCookie(req: Request, name: string): string | undefined {
  const header = req.headers?.cookie;
  if (!header) return undefined;
  const parts = header.split(';').map(p => p.trim());
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = decodeURIComponent(part.slice(0, idx));
    if (key === name) {
      return decodeURIComponent(part.slice(idx + 1));
    }
  }
  return undefined;
}

export const COOKIE_NAMES = {
  access: ACCESS_COOKIE_NAME,
  refresh: REFRESH_COOKIE_NAME,
};
