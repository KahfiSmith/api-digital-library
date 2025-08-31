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

function parseBoolean(val: string | undefined, fallback: boolean): boolean {
  if (val === undefined) return fallback;
  const v = String(val).toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return fallback;
}

function parseSameSite(val: string | undefined): 'lax' | 'strict' | 'none' {
  const v = String(val || '').toLowerCase();
  if (v === 'none' || v === 'lax' || v === 'strict') return v as any;
  return 'lax';
}

const accessMaxAge = parseDurationToMs(process.env.JWT_EXPIRES_IN || '15m', 15 * 60 * 1000);
const refreshMaxAge = parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN || '30d', 30 * 24 * 60 * 60 * 1000);

// Cookie security settings (configurable for cross-site auth)
const cookieSameSite = parseSameSite(process.env.AUTH_COOKIE_SAMESITE);
let cookieSecure = parseBoolean(process.env.AUTH_COOKIE_SECURE, isProd);
// SameSite=None must be Secure (per modern browsers)
if (cookieSameSite === 'none') cookieSecure = true;
const cookieDomain = process.env.AUTH_COOKIE_DOMAIN || undefined;
const cookiePath = process.env.AUTH_COOKIE_PATH || '/';

export function setAuthCookies(res: Response, accessToken: string, refreshToken?: string): void {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    maxAge: accessMaxAge,
    path: cookiePath,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });

  if (refreshToken) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: refreshMaxAge,
      path: cookiePath,
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });
  }
}

export function clearAuthCookies(res: Response): void {
  const base = { path: cookiePath, ...(cookieDomain ? { domain: cookieDomain } : {}) } as const;
  res.clearCookie(ACCESS_COOKIE_NAME, base);
  res.clearCookie(REFRESH_COOKIE_NAME, base);
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
