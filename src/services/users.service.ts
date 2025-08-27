import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/appError';
import bcrypt from 'bcrypt';

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'username' | 'firstName' | 'lastName';
  sortOrder?: 'asc' | 'desc';
}

const baseSelect = {
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  role: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function list(query: UserListQuery) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const skip = (page - 1) * limit;
  const where = {
    AND: [
      query.search
        ? {
            OR: [
              { username: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {},
    ],
  } as any;

  const orderBy = [{ [query.sortBy || 'createdAt']: query.sortOrder || 'desc' } as any];

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy, skip, take: limit, select: baseSelect }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;
  return {
    items,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function getById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: baseSelect });
  if (!user) throw AppError.notFound('User not found');
  return user;
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: baseSelect });
  if (!user) throw AppError.notFound('User not found');
  return user;
}

export async function updateProfile(userId: string, input: { firstName?: string; lastName?: string; avatarUrl?: string | null }) {
  const data: any = {};
  if (typeof input.firstName !== 'undefined') data.firstName = input.firstName;
  if (typeof input.lastName !== 'undefined') data.lastName = input.lastName;
  if (typeof input.avatarUrl !== 'undefined') data.avatarUrl = input.avatarUrl;

  const user = await prisma.user.update({ where: { id: userId }, data, select: baseSelect });
  return user;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw AppError.unauthorized('Current password is incorrect');
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  const passwordHash = await bcrypt.hash(newPassword, rounds);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { success: true };
}
