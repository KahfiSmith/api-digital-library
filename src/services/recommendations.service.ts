import { prisma } from '@/database/prisma';
import { cache, getTtlMs } from '@/utils/cache';
import { logger } from '@/utils/logger';
import { ListType } from '@prisma/client';

export interface RecommendationQuery {
  userId: string;
  limit?: number;
  excludeRead?: boolean;
  minRating?: number;
}

export type SortBy = 'score' | 'rating' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface PaginationSort {
  limit?: number;
  page?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export interface BookRecommendation {
  id: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  rating: number;
  category: {
    id: string;
    name: string;
  };
  recommendationScore: number;
  reasons: string[];
}

export interface RecommendationStats {
  totalRecommendations: number;
  byCategory: Record<string, number>;
  byReason: Record<string, number>;
}

/**
 * Get personalized book recommendations for a user
 */
export async function getPersonalizedRecommendations(
  query: RecommendationQuery & PaginationSort
): Promise<{
  recommendations: BookRecommendation[];
  stats: RecommendationStats;
}> {
  const { userId, limit = 10, page = 1, sortBy = 'score', sortOrder = 'desc', excludeRead = true, minRating = 3.0 } = query;

  // Get user's reading history and preferences
  const [userLoans, userReviews, userLists, userProfile] = await Promise.all([
    prisma.bookLoan.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { loanDate: 'desc' },
    }),
    prisma.bookReview.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
    }),
    prisma.userBookList.findMany({
      where: { userId },
      include: {
        book: {
          include: {
            category: true,
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
    }),
  ]);

  if (!userProfile) {
    throw new Error('User not found');
  }

  // Analyze user preferences
  const preferences = analyzeUserPreferences(userLoans, userReviews, userLists);

  // Get candidate books for recommendations
  const candidateBooks = await getCandidateBooks(
    userId,
    preferences,
    excludeRead,
    minRating
  );

  // Score and rank recommendations
  const scoredRecommendations = scoreRecommendations(
    candidateBooks,
    preferences,
    userReviews
  );

  // Sort and paginate
  const sorted = sortRecommendations(scoredRecommendations, sortBy, sortOrder);
  const offset = Math.max(0, (page - 1) * limit);
  const recommendations = sorted.slice(offset, offset + limit);

  // Calculate stats
  const stats = calculateRecommendationStats(recommendations);

  return {
    recommendations,
    stats,
  };
}

/**
 * Get recommendations based on a specific book (similar books)
 */
export async function getSimilarBooks(
  bookId: string,
  options: PaginationSort = { limit: 5 }
): Promise<BookRecommendation[]> {
  const limit = options.limit ?? 5;
  const page = options.page ?? 1;
  const sortBy = options.sortBy ?? 'score';
  const sortOrder = options.sortOrder ?? 'desc';
  const targetBook = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      category: true,
      bookReviews: {
        select: {
          rating: true,
          userId: true,
        },
      },
    },
  });

  if (!targetBook) {
    throw new Error('Book not found');
  }

  // Find books in the same category with similar ratings
  const similarBooks = await prisma.book.findMany({
    where: {
      AND: [
        { id: { not: bookId } },
        { categoryId: targetBook.categoryId },
        { isActive: true },
        { rating: { gte: Math.max(0, targetBook.rating - 1) } },
      ],
    },
    include: {
      category: true,
      bookReviews: {
        select: {
          rating: true,
          userId: true,
        },
      },
    },
    take: limit * 2, // Get more to allow for filtering
  });

  // Score similarity based on various factors
  const recs = similarBooks
    .map((book) => ({
      id: book.id,
      title: book.title,
      authors: book.authors,
      coverUrl: book.coverUrl,
      rating: book.rating,
      category: {
        id: book.category.id,
        name: book.category.name,
      },
      recommendationScore: calculateSimilarityScore(targetBook, book),
      reasons: ['Similar category', 'Similar rating'],
    }));

  const sorted = sortRecommendations(recs, sortBy, sortOrder);
  const offset = Math.max(0, (page - 1) * limit);
  return sorted.slice(offset, offset + limit);
}

/**
 * Get trending books based on recent activity
 */
export async function getTrendingBooks(options: PaginationSort = { limit: 10 }): Promise<BookRecommendation[]> {
  const limit = options.limit ?? 10;
  const page = options.page ?? 1;
  const sortBy = options.sortBy ?? 'score';
  const sortOrder = options.sortOrder ?? 'desc';
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get base recommendations (cached)
  const baseKey = 'recs:trending:base:v1';
  let recs: BookRecommendation[] | undefined = cache.get<BookRecommendation[]>(baseKey);

  if (!recs) {
    if (process.env.RECS_CACHE_LOG === '1') logger.info('cache_miss', { key: baseKey });
    const trendingBooks = await prisma.book.findMany({
      where: {
        isActive: true,
        OR: [
          {
            bookLoans: {
              some: {
                loanDate: { gte: thirtyDaysAgo },
              },
            },
          },
          {
            bookReviews: {
              some: {
                createdAt: { gte: thirtyDaysAgo },
              },
            },
          },
          {
            bookLists: {
              some: {
                addedAt: { gte: thirtyDaysAgo },
              },
            },
          },
        ],
      },
      include: {
        category: true,
        _count: {
          select: {
            bookLoans: {
              where: { loanDate: { gte: thirtyDaysAgo } },
            },
            bookReviews: {
              where: { createdAt: { gte: thirtyDaysAgo } },
            },
            bookLists: {
              where: { addedAt: { gte: thirtyDaysAgo } },
            },
          },
        },
      },
      take: 200,
    });

    recs = trendingBooks
    .map((book) => ({
      id: book.id,
      title: book.title,
      authors: book.authors,
      coverUrl: book.coverUrl,
      rating: book.rating,
      category: {
        id: book.category.id,
        name: book.category.name,
      },
      recommendationScore: 
        book._count.bookLoans * 3 + 
        book._count.bookReviews * 2 + 
        book._count.bookLists * 1,
      reasons: ['Trending', 'Popular recently'],
    }));

    const ttl = getTtlMs('RECS_CACHE_TTL_MS', 10 * 60 * 1000); // default 10m
    cache.set(baseKey, recs, ttl);
  } else {
    if (process.env.RECS_CACHE_LOG === '1') logger.info('cache_hit', { key: baseKey });
  }

  const sorted = sortRecommendations(recs, sortBy, sortOrder);
  const offset = Math.max(0, (page - 1) * limit);
  return sorted.slice(offset, offset + limit);
}

/**
 * Get recommendations by category
 */
export async function getRecommendationsByCategory(
  categoryId: string,
  options: PaginationSort = { limit: 10 }
): Promise<BookRecommendation[]> {
  const limit = options.limit ?? 10;
  const page = options.page ?? 1;
  const sortBy = options.sortBy ?? 'score';
  const sortOrder = options.sortOrder ?? 'desc';

  const baseKey = `recs:category:${categoryId}:base:v1`;
  let recs: BookRecommendation[] | undefined = cache.get<BookRecommendation[]>(baseKey);

  if (!recs) {
    if (process.env.RECS_CACHE_LOG === '1') logger.info('cache_miss', { key: baseKey });
    const books = await prisma.book.findMany({
    where: {
      categoryId,
      isActive: true,
      rating: { gte: 3.5 },
    },
    include: {
      category: true,
    },
    orderBy: [
      { rating: 'desc' },
      { createdAt: 'desc' },
    ],
      take: 300,
    });

    recs = books.map((book) => ({
    id: book.id,
    title: book.title,
    authors: book.authors,
    coverUrl: book.coverUrl,
    rating: book.rating,
    category: {
      id: book.category.id,
      name: book.category.name,
    },
    recommendationScore: book.rating,
    reasons: ['High rated in category'],
    }));

    const ttl = getTtlMs('RECS_CACHE_TTL_MS', 10 * 60 * 1000); // default 10m
    cache.set(baseKey, recs, ttl);
  } else {
    if (process.env.RECS_CACHE_LOG === '1') logger.info('cache_hit', { key: baseKey });
  }

  const sorted = sortRecommendations(recs, sortBy, sortOrder);
  const offset = Math.max(0, (page - 1) * limit);
  return sorted.slice(offset, offset + limit);
}

// Helper functions

function analyzeUserPreferences(userLoans: any[], userReviews: any[], userLists: any[]) {
  const categoryPreferences: Record<string, number> = {};
  const authorPreferences: Record<string, number> = {};
  const highRatedCategories: Set<string> = new Set();

  // Analyze loan history
  userLoans.forEach((loan) => {
    const categoryId = loan.book.category.id;
    const categoryName = loan.book.category.name;
    categoryPreferences[categoryName] = (categoryPreferences[categoryName] || 0) + 1;

    loan.book.authors.forEach((author: string) => {
      authorPreferences[author] = (authorPreferences[author] || 0) + 1;
    });
  });

  // Analyze review history (higher weight for high ratings)
  userReviews.forEach((review) => {
    const categoryName = review.book.category.name;
    const weight = review.rating >= 4 ? 3 : review.rating >= 3 ? 1 : 0;
    
    if (weight > 0) {
      categoryPreferences[categoryName] = (categoryPreferences[categoryName] || 0) + weight;
      
      if (review.rating >= 4) {
        highRatedCategories.add(categoryName);
      }

      review.book.authors.forEach((author: string) => {
        authorPreferences[author] = (authorPreferences[author] || 0) + weight;
      });
    }
  });

  // Analyze lists (wishlist and favorites have higher weight)
  userLists.forEach((listItem) => {
    const categoryName = listItem.book.category.name;
    const weight = listItem.listType === ListType.FAVORITES ? 2 : 
                   listItem.listType === ListType.WISHLIST ? 1.5 : 1;
    
    categoryPreferences[categoryName] = (categoryPreferences[categoryName] || 0) + weight;

    listItem.book.authors.forEach((author: string) => {
      authorPreferences[author] = (authorPreferences[author] || 0) + weight;
    });
  });

  return {
    categoryPreferences,
    authorPreferences,
    highRatedCategories,
    totalInteractions: userLoans.length + userReviews.length + userLists.length,
  };
}

async function getCandidateBooks(
  userId: string,
  preferences: any,
  excludeRead: boolean,
  minRating: number
) {
  const topCategories = Object.entries(preferences.categoryPreferences)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([category]) => category);

  const topAuthors = Object.entries(preferences.authorPreferences)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([author]) => author);

  let excludeBookIds: string[] = [];
  if (excludeRead) {
    const readBooks = await prisma.bookLoan.findMany({
      where: { userId },
      select: { bookId: true },
    });
    excludeBookIds = readBooks.map((loan) => loan.bookId);
  }

  return await prisma.book.findMany({
    where: {
      AND: [
        { isActive: true },
        { rating: { gte: minRating } },
        { id: { notIn: excludeBookIds } },
        {
          OR: [
            { category: { name: { in: topCategories } } },
            { authors: { hasSome: topAuthors } },
            { rating: { gte: 4.0 } }, // Always include highly rated books
          ],
        },
      ],
    },
    include: {
      category: true,
      _count: {
        select: {
          bookLoans: true,
          bookReviews: true,
        },
      },
    },
    take: 50, // Get more candidates for better filtering
  });
}

function scoreRecommendations(candidateBooks: any[], preferences: any, userReviews: any[]) {
  return candidateBooks.map((book) => {
    let score = 0;
    const reasons: string[] = [];

    // Category preference score (0-30 points)
    const categoryScore = preferences.categoryPreferences[book.category.name] || 0;
    score += Math.min(categoryScore * 5, 30);
    if (categoryScore > 0) {
      reasons.push(`You've enjoyed ${book.category.name} books`);
    }

    // Author preference score (0-20 points)
    const authorScore = book.authors.reduce((sum: number, author: string) => {
      return sum + (preferences.authorPreferences[author] || 0);
    }, 0);
    score += Math.min(authorScore * 3, 20);
    if (authorScore > 0) {
      reasons.push('By authors you like');
    }

    // Book rating score (0-25 points)
    score += book.rating * 5;
    if (book.rating >= 4.5) {
      reasons.push('Highly rated book');
    }

    // Popularity score (0-15 points)
    const popularityScore = (book._count.bookLoans + book._count.bookReviews) * 0.5;
    score += Math.min(popularityScore, 15);
    if (book._count.bookLoans > 10) {
      reasons.push('Popular among readers');
    }

    // High-rated category bonus (0-10 points)
    if (preferences.highRatedCategories.has(book.category.name)) {
      score += 10;
      reasons.push('From a category you rated highly');
    }

    return {
      id: book.id,
      title: book.title,
      authors: book.authors,
      coverUrl: book.coverUrl,
      rating: book.rating,
      category: {
        id: book.category.id,
        name: book.category.name,
      },
      recommendationScore: Math.round(score * 10) / 10,
      reasons: reasons.length > 0 ? reasons : ['Recommended for you'],
    };
  });
}

function calculateSimilarityScore(targetBook: any, candidateBook: any): number {
  let score = 0;

  // Same category
  if (targetBook.categoryId === candidateBook.categoryId) {
    score += 30;
  }

  // Rating similarity (closer ratings = higher score)
  const ratingDiff = Math.abs(targetBook.rating - candidateBook.rating);
  score += Math.max(0, 20 - ratingDiff * 5);

  // Author overlap
  const commonAuthors = targetBook.authors.filter((author: string) =>
    candidateBook.authors.includes(author)
  );
  score += commonAuthors.length * 15;

  // Popular books get slight boost
  score += Math.min(candidateBook.bookReviews.length * 0.5, 10);

  return Math.round(score * 10) / 10;
}

function calculateRecommendationStats(recommendations: BookRecommendation[]): RecommendationStats {
  const byCategory: Record<string, number> = {};
  const byReason: Record<string, number> = {};

  recommendations.forEach((rec) => {
    byCategory[rec.category.name] = (byCategory[rec.category.name] || 0) + 1;

    rec.reasons.forEach((reason) => {
      byReason[reason] = (byReason[reason] || 0) + 1;
    });
  });

  return {
    totalRecommendations: recommendations.length,
    byCategory,
    byReason,
  };
}

function sortRecommendations(
  recs: BookRecommendation[],
  sortBy: SortBy,
  sortOrder: SortOrder
): BookRecommendation[] {
  const factor = sortOrder === 'asc' ? 1 : -1;
  const sorted = [...recs].sort((a, b) => {
    if (sortBy === 'rating') {
      return factor * (a.rating - b.rating);
    }
    if (sortBy === 'title') {
      return factor * a.title.localeCompare(b.title);
    }
    // default: score
    return factor * (a.recommendationScore - b.recommendationScore);
  });
  return sorted;
}
