import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/appError';
import { Role, LoanStatus } from '@prisma/client';

export interface UserListQuery {
  page?: number;
  limit?: number;
  role?: Role;
  isActive?: boolean;
  search?: string;
}

const userSelect = {
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function getStats() {
  const [users, usersActive, books, categories, reviews, loansTotal, loansActive, loansReturned] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.book.count(),
    prisma.category.count(),
    prisma.bookReview.count(),
    prisma.bookLoan.count(),
    prisma.bookLoan.count({ where: { status: LoanStatus.ACTIVE } }),
    prisma.bookLoan.count({ where: { status: LoanStatus.RETURNED } }),
  ]);

  return {
    users: { total: users, active: usersActive },
    books,
    categories,
    reviews,
    loans: { total: loansTotal, active: loansActive, returned: loansReturned },
  };
}

export async function listUsers(query: UserListQuery) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const skip = (page - 1) * limit;

  const where: any = {};
  if (typeof query.isActive === 'boolean') where.isActive = query.isActive;
  if (query.role) where.role = query.role;
  if (query.search) {
    where.OR = [
      { username: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: userSelect }),
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

export async function updateUserStatus(id: string, isActive: boolean) {
  const user = await prisma.user.update({ where: { id }, data: { isActive } , select: userSelect});
  return user;
}

export async function recentActivity(limit = 10) {
  const take = Math.min(100, Math.max(1, Number(limit)));
  const [recentUsers, recentBooks, recentLoans, recentReviews] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take, select: userSelect }),
    prisma.book.findMany({ orderBy: { createdAt: 'desc' }, take }),
    prisma.bookLoan.findMany({ orderBy: { createdAt: 'desc' }, take }),
    prisma.bookReview.findMany({ orderBy: { createdAt: 'desc' }, take }),
  ]);
  return { users: recentUsers, books: recentBooks, loans: recentLoans, reviews: recentReviews };
}

export async function updateUserRole(id: string, role: Role) {
  const user = await prisma.user.update({ where: { id }, data: { role }, select: userSelect });
  return user;
}

export async function analyticsOverview() {
  const [users, books, categories, reviews, loansActive, loansReturned] = await Promise.all([
    prisma.user.count(),
    prisma.book.count(),
    prisma.category.count(),
    prisma.bookReview.count(),
    prisma.bookLoan.count({ where: { status: 'ACTIVE' as any } }),
    prisma.bookLoan.count({ where: { status: 'RETURNED' as any } }),
  ]);
  return { users, books, categories, reviews, loans: { active: loansActive, returned: loansReturned } };
}

export async function analyticsTimeseries(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  const [users, loans, reviews] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.bookLoan.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.bookReview.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);
  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  const init: Record<string, { users: number; loans: number; reviews: number }> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    init[toKey(d)] = { users: 0, loans: 0, reviews: 0 };
  }
  users.forEach(u => { const k = toKey(new Date(u.createdAt)); if (init[k]) init[k].users++; });
  loans.forEach(l => { const k = toKey(new Date(l.createdAt)); if (init[k]) init[k].loans++; });
  reviews.forEach(r => { const k = toKey(new Date(r.createdAt)); if (init[k]) init[k].reviews++; });
  return init;
}

export async function topBooks(limit = 5) {
  const books = await prisma.book.findMany({
    take: limit,
    orderBy: { bookLoans: { _count: 'desc' } } as any,
    include: { _count: { select: { bookLoans: true } } },
  });
  return books.map(b => ({ id: b.id, title: b.title, loans: (b as any)._count.bookLoans }));
}

export async function topCategories(limit = 5) {
  const categories = await prisma.category.findMany({ include: { books: { include: { _count: { select: { bookLoans: true } } } } } });
  const list = categories.map(c => ({ id: c.id, name: c.name, loans: c.books.reduce((sum: number, b: any) => sum + (b._count?.bookLoans || 0), 0) }));
  list.sort((a, b) => b.loans - a.loans);
  return list.slice(0, limit);
}
