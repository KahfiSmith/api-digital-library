import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/appError';
import * as NotificationsService from './notifications.service';

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: 'createdAt' | 'title' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export async function list(query: ListQuery) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const skip = (page - 1) * limit;
  const where = {
    isActive: true,
    AND: [
      query.categoryId ? { categoryId: query.categoryId } : {},
      query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { authors: { hasSome: [query.search] } },
              { tags: { hasSome: [query.search] } },
            ],
          }
        : {},
    ],
  } as any;

  const orderBy = [{ [query.sortBy || 'createdAt']: query.sortOrder || 'desc' } as any];

  const [items, total] = await Promise.all([
    prisma.book.findMany({ where, orderBy, skip, take: limit }),
    prisma.book.count({ where }),
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
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw AppError.notFound('Book not found');
  return book;
}

export async function create(input: {
  title: string;
  authors: string[];
  categoryId: string;
  isbn?: string | null;
  subtitle?: string | null;
  description?: string | null;
  publisher?: string | null;
  publishedDate?: Date | null;
  pageCount?: number | null;
  language?: string; // string in schema with default
  tags?: string[];
}) {
  const book = await prisma.book.create({ data: ({ ...input, tags: input.tags || [] } as any) });
  
  // Send new book notifications to users with wishlist in this category
  try {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (category) {
      await NotificationsService.notifyNewBook(book.title, category.name);
    }
  } catch (error) {
    console.error('Failed to send new book notifications:', error);
  }
  
  return book;
}

export async function update(
  id: string,
  input: Partial<Parameters<typeof create>[0]> & { coverUrl?: string | null; pdfUrl?: string | null }
) {
  try {
    const book = await prisma.book.update({ where: { id }, data: (input as any) });
    return book;
  } catch (e) {
    throw AppError.notFound('Book not found');
  }
}

export async function remove(id: string) {
  try {
    await prisma.book.delete({ where: { id } });
    return { success: true };
  } catch (e) {
    throw AppError.notFound('Book not found');
  }
}
