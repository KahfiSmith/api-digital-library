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

  const where = { bookId, isPublic: true };
  const [items, total] = await Promise.all([
    prisma.bookReview.findMany({ 
      where, 
      skip, 
      take: limit, 
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { 
          select: { id: true, username: true, firstName: true, lastName: true } 
        }
      }
    }),
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
    prisma.bookReview.findMany({ 
      where, 
      skip, 
      take: limit, 
      orderBy: { createdAt: 'desc' },
      include: { 
        book: { 
          select: { id: true, title: true, authors: true, coverUrl: true, rating: true } 
        }
      }
    }),
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

async function updateBookRating(bookId: string) {
  const avgResult = await prisma.bookReview.aggregate({
    where: { bookId },
    _avg: { rating: true },
  });
  const averageRating = avgResult._avg.rating || 0;
  await prisma.book.update({
    where: { id: bookId },
    data: { rating: Math.round(averageRating * 100) / 100 }, // Round to 2 decimal places
  });
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

  // Update book's average rating
  await updateBookRating(input.bookId);
  
  return review;
}

export async function update(id: string, input: { rating?: number; reviewText?: string | null; isPublic?: boolean }) {
  if (typeof input.rating !== 'undefined') {
    if (input.rating < 1 || input.rating > 5) throw AppError.badRequest('Rating must be between 1 and 5');
  }
  const review = await prisma.bookReview.update({ where: { id }, data: input });

  // Update book's average rating if rating was changed
  if (typeof input.rating !== 'undefined') {
    await updateBookRating(review.bookId);
  }
  
  return review;
}

export async function remove(id: string) {
  const review = await prisma.bookReview.findUnique({ where: { id } });
  if (!review) throw AppError.notFound('Review not found');
  
  const bookId = review.bookId;
  await prisma.bookReview.delete({ where: { id } });

  // Update book's average rating after deletion
  await updateBookRating(bookId);
  
  return { success: true };
}

export async function getById(id: string) {
  const review = await prisma.bookReview.findUnique({ where: { id } });
  if (!review) throw AppError.notFound('Review not found');
  return review;
}

