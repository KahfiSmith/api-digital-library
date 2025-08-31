import { Request, Response } from 'express';
import { prisma } from '@/database/prisma';
import { ResponseUtil } from '@/utils/response';
import { AppError } from '@/utils/appError';

export async function searchBooks(req: Request, res: Response) {
  const { query, page, limit, language, categoryId, minRating, maxRating, start, end, sortBy, sortOrder, availability, hasReviews } = req.query as any;
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
      availability === 'available' ? { availableCopies: { gt: 0 } } : {},
      availability === 'unavailable' ? { availableCopies: { lte: 0 } } : {},
      hasReviews === 'true' ? { bookReviews: { some: {} } } : {},
      hasReviews === 'false' ? { bookReviews: { none: {} } } : {},
      {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { authors: { hasSome: [q] } },
          { tags: { hasSome: [q] } },
          { description: { contains: q, mode: 'insensitive' } },
          { publisher: { contains: q, mode: 'insensitive' } },
          { isbn: { contains: q, mode: 'insensitive' } },
        ],
      },
    ],
  } as any;

  const orderBy = [] as any[];
  const ord = String(sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  const field = (sortBy as string) || 'rating';
  if (field === 'rating') orderBy.push({ rating: ord });
  else if (field === 'createdAt') orderBy.push({ createdAt: ord });
  else if (field === 'publishedDate') orderBy.push({ publishedDate: ord });
  else if (field === 'title') orderBy.push({ title: ord });
  else if (field === 'availability') orderBy.push({ availableCopies: ord });
  if (field !== 'createdAt') orderBy.push({ createdAt: 'desc' });

  const [items, total] = await Promise.all([
    prisma.book.findMany({ 
      where, 
      skip, 
      take: l, 
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            bookReviews: true,
            bookLoans: true
          }
        }
      }
    }),
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

export async function searchCategories(req: Request, res: Response) {
  const { query, page, limit } = req.query as any;
  const q = String(query || '').trim();
  if (!q) return ResponseUtil.success(res, 'No query provided', { items: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 0, hasNextPage: false, hasPrevPage: false } });
  
  const p = Math.max(1, Number(page || 1));
  const l = Math.min(50, Math.max(1, Number(limit || 10)));
  const skip = (p - 1) * l;

  const where = {
    isActive: true,
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ],
  } as any;

  const [items, total] = await Promise.all([
    prisma.category.findMany({ 
      where, 
      skip, 
      take: l, 
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            books: {
              where: { isActive: true }
            }
          }
        }
      }
    }),
    prisma.category.count({ where }),
  ]);

  const totalPages = Math.ceil(total / l) || 1;
  return ResponseUtil.paginated(res, 'Categories search results', items, {
    currentPage: p,
    totalPages,
    totalItems: total,
    itemsPerPage: l,
    hasNextPage: p < totalPages,
    hasPrevPage: p > 1,
  });
}

export async function searchUsers(req: Request, res: Response) {
  const { query, page, limit, role } = req.query as any;
  const userRole = req.user?.role;
  
  // Only admins and librarians can search users
  if (userRole !== 'ADMIN' && userRole !== 'LIBRARIAN') {
    throw AppError.forbidden('Access denied');
  }

  const q = String(query || '').trim();
  if (!q) return ResponseUtil.success(res, 'No query provided', { items: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 0, hasNextPage: false, hasPrevPage: false } });
  
  const p = Math.max(1, Number(page || 1));
  const l = Math.min(50, Math.max(1, Number(limit || 10)));
  const skip = (p - 1) * l;

  const where = {
    isActive: true,
    AND: [
      role ? { role: String(role).toUpperCase() } : {},
      {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
    ],
  } as any;

  const [items, total] = await Promise.all([
    prisma.user.findMany({ 
      where, 
      skip, 
      take: l, 
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            bookLoans: true,
            bookReviews: true
          }
        }
      }
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / l) || 1;
  return ResponseUtil.paginated(res, 'Users search results', items, {
    currentPage: p,
    totalPages,
    totalItems: total,
    itemsPerPage: l,
    hasNextPage: p < totalPages,
    hasPrevPage: p > 1,
  });
}

export async function globalSearch(req: Request, res: Response) {
  const { query, types, page, limit } = req.query as any;
  const q = String(query || '').trim();
  if (!q) return ResponseUtil.success(res, 'No query provided', { books: [], categories: [], users: [] });
  
  const searchTypes = types ? String(types).split(',') : ['books', 'categories'];
  const p = Math.max(1, Number(page || 1));
  const l = Math.min(20, Math.max(1, Number(limit || 5))); // Smaller limit for global search
  const skip = (p - 1) * l;

  const results: any = {};

  if (searchTypes.includes('books')) {
    const booksWhere = {
      isActive: true,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { authors: { hasSome: [q] } },
        { tags: { hasSome: [q] } },
        { description: { contains: q, mode: 'insensitive' } },
        { publisher: { contains: q, mode: 'insensitive' } },
        { isbn: { contains: q, mode: 'insensitive' } },
      ],
    } as any;

    results.books = await prisma.book.findMany({
      where: booksWhere,
      take: l,
      orderBy: { rating: 'desc' },
      include: {
        category: {
          select: { name: true }
        }
      }
    });
  }

  if (searchTypes.includes('categories')) {
    const categoriesWhere = {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    } as any;

    results.categories = await prisma.category.findMany({
      where: categoriesWhere,
      take: l,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            books: {
              where: { isActive: true }
            }
          }
        }
      }
    });
  }

  if (searchTypes.includes('users') && (req.user?.role === 'ADMIN' || req.user?.role === 'LIBRARIAN')) {
    const usersWhere = {
      isActive: true,
      OR: [
        { username: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    } as any;

    results.users = await prisma.user.findMany({
      where: usersWhere,
      take: l,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true
      }
    });
  }

  return ResponseUtil.success(res, 'Global search results', results);
}