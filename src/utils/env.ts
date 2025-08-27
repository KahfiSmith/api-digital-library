import { logger } from '@/utils/logger';

export function validateEnv(): void {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.JWT_REFRESH_SECRET) missing.push('JWT_REFRESH_SECRET');

  if (missing.length > 0) {
    const msg = `Missing required env vars: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      logger.error(msg);
      throw new Error(msg);
    } else {
      logger.warn(msg);
    }
  }
}

