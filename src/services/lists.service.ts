import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/appError';
import { ListType } from '@/types/enums';

export interface ListQuery {
  page?: number;
  limit?: number;
}

export async function listByType(userId: string, listType: ListType, query: ListQuery) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const skip = (page - 1) * limit;

  const where = { userId, listType };
  const [items, total] = await Promise.all([
    prisma.userBookList.findMany({ where, skip, take: limit, orderBy: { addedAt: 'desc' }, include: { book: true } }),
    prisma.userBookList.count({ where }),
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

export async function add(userId: string, bookId: string, listType: ListType) {
  // Ensure book exists
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw AppError.notFound('Book not found');

  const entry = await prisma.userBookList.create({
    data: { userId, bookId, listType },
    include: { book: true },
  });
  return entry;
}

export async function remove(userId: string, bookId: string, listType: ListType) {
  await prisma.userBookList.delete({
    where: {
      userId_bookId_listType: { userId, bookId, listType },
    },
  });
  return { success: true };
}

export async function listAll(userId: string) {
  const items = await prisma.userBookList.findMany({ where: { userId }, include: { book: true } });
  const grouped: Record<ListType, any[]> = {
    [ListType.FAVORITES]: [],
    [ListType.WISHLIST]: [],
    [ListType.READING]: [],
    [ListType.COMPLETED]: [],
  };
  for (const it of items) {
    grouped[it.listType as ListType].push(it);
  }
  return grouped;
}
