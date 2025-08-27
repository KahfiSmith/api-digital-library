import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/appError';

export interface ListQuery {
  page?: number;
  limit?: number;
}

export async function listByBook(bookId: string, query: ListQuery) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const skip = (page - 1) * limit;

  const where = { bookId };
  const [items, total] = await Promise.all([
    prisma.bookReview.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.bookReview.count({ where }),
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

export async function listByUser(userId: string, query: ListQuery) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const skip = (page - 1) * limit;

  const where = { userId };
  const [items, total] = await Promise.all([
    prisma.bookReview.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.bookReview.count({ where }),
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

export async function create(userId: string, input: { bookId: string; rating: number; reviewText?: string | null; isPublic?: boolean }) {
  if (input.rating < 1 || input.rating > 5) throw AppError.badRequest('Rating must be between 1 and 5');
  // Ensure book exists
  const book = await prisma.book.findUnique({ where: { id: input.bookId } });
  if (!book) throw AppError.notFound('Book not found');

  const review = await prisma.bookReview.create({
    data: {
      userId,
      bookId: input.bookId,
      rating: input.rating,
      reviewText: input.reviewText,
      isPublic: typeof input.isPublic === 'boolean' ? input.isPublic : true,
    },
  });
  return review;
}

export async function update(id: string, input: { rating?: number; reviewText?: string | null; isPublic?: boolean }) {
  if (typeof input.rating !== 'undefined') {
    if (input.rating < 1 || input.rating > 5) throw AppError.badRequest('Rating must be between 1 and 5');
  }
  const review = await prisma.bookReview.update({ where: { id }, data: input });
  return review;
}

export async function remove(id: string) {
  await prisma.bookReview.delete({ where: { id } });
  return { success: true };
}

export async function getById(id: string) {
  const review = await prisma.bookReview.findUnique({ where: { id } });
  if (!review) throw AppError.notFound('Review not found');
  return review;
}

