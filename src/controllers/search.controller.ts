import { Request, Response } from 'express';
import { prisma } from '@/database/prisma';
import { ResponseUtil } from '@/utils/response';

export async function searchBooks(req: Request, res: Response) {
  const { query, page, limit, language, categoryId, minRating, maxRating, start, end, sortBy, sortOrder } = req.query as any;
  const q = String(query || '').trim();
  if (!q) return ResponseUtil.success(res, 'No query provided', { items: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 0, hasNextPage: false, hasPrevPage: false } });
  const p = Math.max(1, Number(page || 1));
  const l = Math.min(50, Math.max(1, Number(limit || 10)));
  const skip = (p - 1) * l;

  const where = {
    isActive: true,
    AND: [
      language ? { language: String(language) } : {},
      categoryId ? { categoryId: String(categoryId) } : {},
      typeof minRating !== 'undefined' || typeof maxRating !== 'undefined'
        ? { rating: { gte: minRating ? Number(minRating) : undefined, lte: maxRating ? Number(maxRating) : undefined } }
        : {},
      start || end
        ? { publishedDate: { gte: start ? new Date(start) : undefined, lte: end ? new Date(end) : undefined } }
        : {},
      {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { authors: { hasSome: [q] } },
          { tags: { hasSome: [q] } },
          { description: { contains: q, mode: 'insensitive' } },
          { publisher: { contains: q, mode: 'insensitive' } },
        ],
      },
    ],
  } as any;

  const orderBy = [] as any[];
  const ord = String(sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  const field = (sortBy as string) || 'rating';
  if (field === 'rating') orderBy.push({ rating: ord });
  else if (field === 'createdAt') orderBy.push({ createdAt: ord });
  else if (field === 'title') orderBy.push({ title: ord });
  if (field !== 'createdAt') orderBy.push({ createdAt: 'desc' });

  const [items, total] = await Promise.all([
    prisma.book.findMany({ where, skip, take: l, orderBy }),
    prisma.book.count({ where }),
  ]);

  const totalPages = Math.ceil(total / l) || 1;
  return ResponseUtil.paginated(res, 'Books search results', items, {
    currentPage: p,
    totalPages,
    totalItems: total,
    itemsPerPage: l,
    hasNextPage: p < totalPages,
    hasPrevPage: p > 1,
  });
}
