import bcrypt from 'bcrypt';
import { prisma } from '@/database/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/token';
import { AppError } from '@/utils/appError';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { sendMail, verificationEmailTemplate, resetEmailTemplate } from '@/utils/email';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

function sanitizeUser<T extends { passwordHash?: string }>(user: T) {
  const { passwordHash, ...rest } = user as any;
  return rest;
}

export async function register(input: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const { username, email, password, firstName, lastName } = input;

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) throw AppError.badRequest('Email or username already registered');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: { username, email, passwordHash, firstName, lastName },
  });

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const { token: refreshToken, jti, expiresAt } = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, BCRYPT_ROUNDS),
      expiresAt,
    },
  });

  // Issue email verification token
  const { tokenId: emailTokenId, token: emailToken, link: verificationLink } = await issueEmailVerification(user.id, user.email);
  // Fire-and-forget email sending
  sendMail({ to: user.email, subject: 'Verify your email', html: verificationEmailTemplate(verificationLink) }).catch(() => {});

  return { user: sanitizeUser(user), tokens: { accessToken, refreshToken }, verification: { tokenId: emailTokenId, token: process.env.NODE_ENV !== 'production' ? emailToken : undefined, link: verificationLink } };
}

export async function login(input: { identifier: string; password: string }) {
  const { identifier, password } = input;
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });
  if (!user || !user.isActive) throw AppError.unauthorized('Invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw AppError.unauthorized('Invalid credentials');

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  const { token: refreshToken, jti, expiresAt } = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, BCRYPT_ROUNDS),
      expiresAt,
    },
  });

  return { user: sanitizeUser(user), tokens: { accessToken, refreshToken } };
}

export async function refresh(input: { refreshToken: string }) {
  const { refreshToken } = input;
  let payload: { userId: string; jti: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Invalid refresh token');
  }

  // Load token record by id (jti)
  const tokenRecord = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
  if (!tokenRecord || tokenRecord.isRevoked) throw AppError.unauthorized('Refresh token revoked');
  if (tokenRecord.expiresAt < new Date()) throw AppError.unauthorized('Refresh token expired');

  const matches = await bcrypt.compare(refreshToken, tokenRecord.tokenHash);
  if (!matches) throw AppError.unauthorized('Refresh token mismatch');

  // Rotate: revoke old, create new
  await prisma.refreshToken.update({ where: { id: tokenRecord.id }, data: { isRevoked: true } });

  const { token: newRefreshToken, jti, expiresAt } = signRefreshToken(payload.userId);
  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId: payload.userId,
      tokenHash: await bcrypt.hash(newRefreshToken, BCRYPT_ROUNDS),
      expiresAt,
    },
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.userId } });
  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });

  return { user: sanitizeUser(user), tokens: { accessToken, refreshToken: newRefreshToken } };
}

export async function logout(input: { refreshToken: string }) {
  const { refreshToken } = input;
  try {
    const { jti } = verifyRefreshToken(refreshToken);
    await prisma.refreshToken.update({ where: { id: jti }, data: { isRevoked: true } });
  } catch {
    // Best-effort logout: do not leak details
  }
  return { success: true };
}

function randomToken(bytes = 24): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export async function issueEmailVerification(userId: string, email: string) {
  const token = randomToken(24);
  const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  const rec = await (prisma as any).emailVerificationToken.create({ data: { userId, tokenHash, expiresAt } });
  const link = `${process.env.APP_BASE_URL || 'http://localhost:' + (process.env.PORT || 3001)}/api/v1/auth/verify-email?tokenId=${rec.id}&token=${token}`;
  return { tokenId: rec.id, token, expiresAt, link };
}

export async function verifyEmail(input: { tokenId: string; token: string }) {
  const { tokenId, token } = input;
  const rec = await (prisma as any).emailVerificationToken.findUnique({ where: { id: tokenId } });
  if (!rec || rec.isUsed) throw AppError.badRequest('Invalid or used token');
  if (rec.expiresAt < new Date()) throw AppError.badRequest('Token expired');
  const ok = await bcrypt.compare(token, rec.tokenHash);
  if (!ok) throw AppError.badRequest('Invalid token');
  await prisma.$transaction([
    prisma.user.update({ where: { id: rec.userId }, data: { emailVerified: true } }),
    (prisma as any).emailVerificationToken.update({ where: { id: rec.id }, data: { isUsed: true } }),
  ]);
  return { success: true };
}

export async function requestPasswordReset(input: { email: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    // Do not leak existence
    return { success: true };
  }
  const token = randomToken(24);
  const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
  const rec = await (prisma as any).passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });
  const link = `${process.env.APP_BASE_URL || 'http://localhost:' + (process.env.PORT || 3001)}/api/v1/auth/reset-password?tokenId=${rec.id}&token=${token}`;
  // Send email
  sendMail({ to: user.email, subject: 'Reset your password', html: resetEmailTemplate(link) }).catch(() => {});
  return { success: true, reset: process.env.NODE_ENV !== 'production' ? { tokenId: rec.id, token, link } : undefined };
}

export async function resetPassword(input: { tokenId: string; token: string; newPassword: string }) {
  const { tokenId, token, newPassword } = input;
  const rec = await (prisma as any).passwordResetToken.findUnique({ where: { id: tokenId } });
  if (!rec || rec.isUsed) throw AppError.badRequest('Invalid or used token');
  if (rec.expiresAt < new Date()) throw AppError.badRequest('Token expired');
  const ok = await bcrypt.compare(token, rec.tokenHash);
  if (!ok) throw AppError.badRequest('Invalid token');
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({ where: { id: rec.userId }, data: { passwordHash } }),
    (prisma as any).passwordResetToken.update({ where: { id: rec.id }, data: { isUsed: true } }),
  ]);
  return { success: true };
}
