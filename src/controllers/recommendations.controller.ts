import { Request, Response } from 'express';
import * as RecommendationService from '@/services/recommendations.service';
import { ResponseUtil } from '@/utils/response';
import crypto from 'crypto';
import { getTtlMs } from '@/utils/cache';
import { AppError } from '@/utils/appError';

/**
 * Get personalized book recommendations for the current user
 */
export async function getPersonalizedRecommendations(req: Request, res: Response) {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }

  const { limit, excludeRead, minRating, page, sortBy, sortOrder } = req.query as any;
  
  const query = {
    userId,
    limit: limit ? parseInt(limit as string) : undefined,
    excludeRead: excludeRead ? excludeRead === 'true' : undefined,
    minRating: minRating ? parseFloat(minRating as string) : undefined,
  };

  const result = await RecommendationService.getPersonalizedRecommendations({
    ...query,
    page: page ? parseInt(page as string) : 1,
    sortBy: (sortBy as any) || 'score',
    sortOrder: (sortOrder as any) || 'desc',
  });
  
  return ResponseUtil.success(res, 'Personalized recommendations retrieved', {
    recommendations: result.recommendations,
    stats: result.stats,
    query: {
      userId,
      limit: query.limit || 10,
      page: page ? parseInt(page as string) : 1,
      sortBy: (sortBy as any) || 'score',
      sortOrder: (sortOrder as any) || 'desc',
      excludeRead: query.excludeRead !== false,
      minRating: query.minRating || 3.0,
    },
  });
}

/**
 * Get books similar to a specific book
 */
export async function getSimilarBooks(req: Request, res: Response) {
  const { bookId } = req.params;
  const { limit, page, sortBy, sortOrder } = req.query as any;
  
  if (!bookId) {
    throw new AppError('Book ID is required', 400);
  }

  const recommendations = await RecommendationService.getSimilarBooks(
    bookId,
    {
      limit: limit ? parseInt(limit as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      sortBy: (sortBy as any) || 'score',
      sortOrder: (sortOrder as any) || 'desc',
    }
  );
  
  return ResponseUtil.success(res, 'Similar books retrieved', {
    bookId,
    recommendations,
    total: recommendations.length,
  });
}

/**
 * Get trending books based on recent activity
 */
export async function getTrendingBooks(req: Request, res: Response) {
  const { limit, page, sortBy, sortOrder } = req.query as any;
  
  const recommendations = await RecommendationService.getTrendingBooks({
    limit: limit ? parseInt(limit as string) : undefined,
    page: page ? parseInt(page as string) : 1,
    sortBy: (sortBy as any) || 'score',
    sortOrder: (sortOrder as any) || 'desc',
  });
  // Cache headers for public trending data
  const ttlSec = Math.floor(getTtlMs('RECS_CACHE_TTL_MS', 10 * 60 * 1000) / 1000);
  if (ttlSec > 0) {
    res.set('Cache-Control', `public, max-age=${ttlSec}`);
  }

  // ETag handling (conditional GET)
  const etagPayload = {
    recommendations,
    limit: limit ? parseInt(limit as string) : undefined,
    page: page ? parseInt(page as string) : 1,
    sortBy: (sortBy as any) || 'score',
    sortOrder: (sortOrder as any) || 'desc',
  };
  const etag = 'W/"' + crypto.createHash('sha1').update(JSON.stringify(etagPayload)).digest('hex') + '"';
  const incoming = req.headers['if-none-match'];
  if (incoming && incoming === etag) {
    res.status(304).end();
    return;
  }
  res.set('ETag', etag);
  
  return ResponseUtil.success(res, 'Trending books retrieved', {
    recommendations,
    total: recommendations.length,
    period: 'Last 30 days',
  });
}

/**
 * Get book recommendations by category
 */
export async function getRecommendationsByCategory(req: Request, res: Response) {
  const { categoryId } = req.params;
  const { limit, page, sortBy, sortOrder } = req.query as any;
  
  if (!categoryId) {
    throw new AppError('Category ID is required', 400);
  }

  const recommendations = await RecommendationService.getRecommendationsByCategory(
    categoryId,
    {
      limit: limit ? parseInt(limit as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      sortBy: (sortBy as any) || 'score',
      sortOrder: (sortOrder as any) || 'desc',
    }
  );
  // Cache headers for public category recommendations
  const ttlSec = Math.floor(getTtlMs('RECS_CACHE_TTL_MS', 10 * 60 * 1000) / 1000);
  if (ttlSec > 0) {
    res.set('Cache-Control', `public, max-age=${ttlSec}`);
  }

  // ETag handling (conditional GET)
  const etagPayload = {
    categoryId,
    recommendations,
    limit: limit ? parseInt(limit as string) : undefined,
    page: page ? parseInt(page as string) : 1,
    sortBy: (sortBy as any) || 'score',
    sortOrder: (sortOrder as any) || 'desc',
  };
  const etag = 'W/"' + crypto.createHash('sha1').update(JSON.stringify(etagPayload)).digest('hex') + '"';
  const incoming = req.headers['if-none-match'];
  if (incoming && incoming === etag) {
    res.status(304).end();
    return;
  }
  res.set('ETag', etag);
  
  return ResponseUtil.success(res, 'Category recommendations retrieved', {
    categoryId,
    recommendations,
    total: recommendations.length,
  });
}

/**
 * Get recommendation analytics for admin
 */
export async function getRecommendationAnalytics(req: Request, res: Response) {
  // This could be extended to provide analytics about recommendation performance
  // For now, we'll provide basic stats
  
  const [
    totalBooks,
    totalCategories,
    totalUsers,
    recentLoans,
    recentReviews
  ] = await Promise.all([
    (await import('@/database/prisma')).prisma.book.count({ where: { isActive: true } }),
    (await import('@/database/prisma')).prisma.category.count({ where: { isActive: true } }),
    (await import('@/database/prisma')).prisma.user.count({ where: { isActive: true } }),
    (await import('@/database/prisma')).prisma.bookLoan.count({
      where: {
        loanDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    (await import('@/database/prisma')).prisma.bookReview.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })
  ]);

  return ResponseUtil.success(res, 'Recommendation analytics retrieved', {
    system: {
      totalBooks,
      totalCategories,
      totalActiveUsers: totalUsers,
      recentActivity: {
        loans: recentLoans,
        reviews: recentReviews,
        period: 'Last 30 days'
      }
    },
    algorithms: {
      personalizedRecommendations: {
        description: 'Based on user loan history, reviews, and book lists',
        factors: ['Category preferences', 'Author preferences', 'Rating patterns', 'Book popularity']
      },
      similarBooks: {
        description: 'Books similar to a specific book',
        factors: ['Same category', 'Similar ratings', 'Common authors']
      },
      trendingBooks: {
        description: 'Books with high recent activity',
        factors: ['Recent loans', 'Recent reviews', 'Recent list additions']
      },
      categoryRecommendations: {
        description: 'Top-rated books in a specific category',
        factors: ['Book rating', 'Creation date']
      }
    }
  });
}
