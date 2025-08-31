import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/appError';
import { Role, LoanStatus } from '@prisma/client';

export type UserEngagementQuery = {
  startDate?: Date;
  endDate?: Date;
  minActivityCount?: number;
}

export type BookPopularityQuery = {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  includeDetails?: boolean;
}

export type UserListQuery = {
  page?: number;
  limit?: number;
  role?: Role;
  isActive?: boolean;
  search?: string;
};

export type SystemStatsQuery = {
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'day' | 'week' | 'month';
};

export type LoanStatisticsQuery = {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
};

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

/**
 * Gets basic system stats
 */
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

/**
 * Lists users with pagination and filtering
 */
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

/**
 * Updates a user's active status
 */
export async function updateUserStatus(id: string, isActive: boolean) {
  try {
    return await prisma.user.update({
      where: { id },
      data: { isActive },
      select: userSelect,
    });
  } catch (error) {
    throw new AppError('User not found', 404);
  }
}

/**
 * Updates a user's role
 */
export async function updateUserRole(id: string, role: Role) {
  try {
    return await prisma.user.update({
      where: { id },
      data: { role },
      select: userSelect,
    });
  } catch (error) {
    throw new AppError('User not found', 404);
  }
}

/**
 * Gets recent activity (loans, reviews, new users)
 */
export async function recentActivity(limit = 10) {
  const [loans, reviews, users] = await Promise.all([
    prisma.bookLoan.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true, firstName: true, lastName: true } },
        book: { select: { title: true, authors: true } },
      },
    }),
    prisma.bookReview.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true, firstName: true, lastName: true } },
        book: { select: { title: true, authors: true } },
      },
    }),
    prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: userSelect,
    }),
  ]);

  return {
    loans: loans.map(l => ({
      id: l.id,
      type: 'loan',
      status: l.status,
      date: l.createdAt,
      user: l.user,
      book: { ...l.book, author: l.book.authors[0] || '' },
    })),
    reviews: reviews.map(r => ({
      id: r.id,
      type: 'review',
      rating: r.rating,
      date: r.createdAt,
      user: r.user,
      book: { ...r.book, author: r.book.authors[0] || '' },
    })),
    users: users.map(u => ({
      id: u.id,
      type: 'user',
      date: u.createdAt,
      username: u.username,
      name: `${u.firstName} ${u.lastName}`,
      role: u.role,
    })),
  };
}

/**
 * Gets loan statistics with various metrics
 */
export async function getLoanStatistics(query: LoanStatisticsQuery = {}) {
  const { startDate, endDate, categoryId } = query;
  
  // Prepare date filters
  const dateFilter: any = {};
  if (startDate) dateFilter.gte = startDate;
  if (endDate) dateFilter.lte = endDate;
  
  // Get loan data with book information
  const loans = await prisma.bookLoan.findMany({
    where: startDate || endDate ? { loanDate: dateFilter } : {},
    include: {
      user: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
      book: {
        select: {
          id: true,
          title: true,
          authors: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  
  // Filter by category if needed
  const filteredLoans = categoryId 
    ? loans.filter(loan => loan.book.categoryId === categoryId)
    : loans;
  
  // Calculate loan status distribution
  const statusDistribution = filteredLoans.reduce((acc: Record<string, number>, loan) => {
    acc[loan.status] = (acc[loan.status] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate average loan duration
  let totalDuration = 0;
  let loanCount = 0;
  filteredLoans.forEach(loan => {
    if (loan.status === LoanStatus.RETURNED && loan.returnDate) {
      const loanDate = new Date(loan.loanDate);
      const returnDate = new Date(loan.returnDate);
      const duration = Math.floor((returnDate.getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24));
      totalDuration += duration;
      loanCount++;
    }
  });
  
  const avgLoanDuration = loanCount > 0 ? Math.round(totalDuration / loanCount) : 0;
  
  // Calculate user role distribution
  const roleDistribution = filteredLoans.reduce((acc: Record<string, number>, loan) => {
    const role = loan.user.role;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate category distribution
  const categoryDistribution = filteredLoans.reduce((acc: Record<string, number>, loan) => {
    if (loan.book.category) {
      const categoryName = loan.book.category.name;
      acc[categoryName] = (acc[categoryName] || 0) + 1;
    }
    return acc;
  }, {});
  
  return {
    totalLoans: filteredLoans.length,
    statusDistribution,
    avgLoanDuration,
    roleDistribution,
    categoryDistribution,
  };
}

/**
 * Gets user engagement metrics
 */
export async function getUserEngagement(query: UserEngagementQuery = {}) {
  const { startDate, endDate, minActivityCount = 1 } = query;
  
  // Prepare date filters
  const dateFilter: any = {};
  if (startDate) dateFilter.gte = startDate;
  if (endDate) dateFilter.lte = endDate;
  
  // Get user activity data
  const [loans, reviews, lists] = await Promise.all([
    prisma.bookLoan.findMany({
      where: startDate || endDate ? { loanDate: dateFilter } : {},
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true
          }
        }
      }
    }),
    prisma.bookReview.findMany({
      where: startDate || endDate ? { createdAt: dateFilter } : {},
      select: {
        userId: true,
        rating: true
      }
    }),
    prisma.userBookList.findMany({
      where: startDate || endDate ? { addedAt: dateFilter } : {},
      select: {
        userId: true,
        listType: true
      }
    })
  ]);
  
  // Combine all user activities
  const userActivities: Record<string, {
    user: any;
    loanCount: number;
    reviewCount: number;
    listCount: number;
    totalActivity: number;
    avgRating: number;
  }> = {};
  
  // Process loans
  loans.forEach((loan: any) => {
    const userId = loan.userId;
    if (!userActivities[userId]) {
      userActivities[userId] = {
        user: loan.user,
        loanCount: 0,
        reviewCount: 0,
        listCount: 0,
        totalActivity: 0,
        avgRating: 0
      };
    }
    userActivities[userId].loanCount++;
    userActivities[userId].totalActivity++;
  });
  
  // Process reviews
  const userRatings: Record<string, { sum: number, count: number }> = {};
  reviews.forEach((review: any) => {
    const userId = review.userId;
    if (!userActivities[userId]) {
      userActivities[userId] = {
        user: null, // Will be filled from users query
        loanCount: 0,
        reviewCount: 0,
        listCount: 0,
        totalActivity: 0,
        avgRating: 0
      };
    }
    userActivities[userId].reviewCount++;
    userActivities[userId].totalActivity++;
    
    // Track ratings for average calculation
    if (!userRatings[userId]) userRatings[userId] = { sum: 0, count: 0 };
    userRatings[userId].sum += review.rating;
    userRatings[userId].count++;
  });
  
  // Process lists
  lists.forEach((list: any) => {
    const userId = list.userId;
    if (!userActivities[userId]) {
      userActivities[userId] = {
        user: null,
        loanCount: 0,
        reviewCount: 0,
        listCount: 0,
        totalActivity: 0,
        avgRating: 0
      };
    }
    userActivities[userId].listCount++;
    userActivities[userId].totalActivity++;
  });
  
  // Calculate average ratings
  Object.keys(userRatings).forEach(userId => {
    const rating = userRatings[userId];
    if (userActivities[userId] && rating && rating.count > 0) {
      userActivities[userId].avgRating = 
        parseFloat((rating.sum / rating.count).toFixed(1));
    }
  });
  
  // Get missing user data
  const userIds = Object.keys(userActivities).filter(id => userActivities[id] && !userActivities[id].user);
  if (userIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });
    
    users.forEach(user => {
      const activity = userActivities[user.id];
      if (user.id && activity) {
        activity.user = user;
      }
    });
  }
  
  // Convert to array and filter by minimum activity
  const result = Object.values(userActivities)
    .filter(item => item.totalActivity >= minActivityCount && item.user)
    .sort((a, b) => b.totalActivity - a.totalActivity);
  
  // Calculate engagement stats
  const totalUsers = Object.keys(userActivities).length;
  const activeUsers = result.length;
  
  // Activity distribution by type
  const activityDistribution = {
    loans: result.reduce((sum, item) => sum + item.loanCount, 0),
    reviews: result.reduce((sum, item) => sum + item.reviewCount, 0),
    lists: result.reduce((sum, item) => sum + item.listCount, 0)
  };
  
  // User role distribution
  const roleDistribution = result.reduce((acc: Record<string, number>, item) => {
    const role = item.user.role;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  
  // Top engaged users (top 10)
  const topUsers = result.slice(0, 10).map(item => ({
    id: item.user.id,
    username: item.user.username,
    name: `${item.user.firstName} ${item.user.lastName}`,
    role: item.user.role,
    totalActivity: item.totalActivity,
    loanCount: item.loanCount,
    reviewCount: item.reviewCount,
    listCount: item.listCount,
    avgRating: item.avgRating
  }));
  
  return {
    totalUsers,
    activeUsers,
    activityDistribution,
    roleDistribution,
    topUsers,
    engagementRate: totalUsers > 0 ? parseFloat((activeUsers / totalUsers * 100).toFixed(1)) : 0
  };
}

/**
 * Gets book popularity metrics
 */
export async function getBookPopularityMetrics(query: BookPopularityQuery = {}) {
  const { startDate, endDate, limit = 10, includeDetails = true } = query;
  
  // Prepare date filters
  const dateFilter: any = {};
  if (startDate) dateFilter.gte = startDate;
  if (endDate) dateFilter.lte = endDate;
  
  // Get book activity data
  const [loans, reviews, lists] = await Promise.all([
    prisma.bookLoan.findMany({
      where: startDate || endDate ? { loanDate: dateFilter } : {},
      select: {
        bookId: true,
        book: includeDetails ? {
          select: {
            id: true,
            title: true,
            authors: true,
            isbn: true,
            coverUrl: true,
            category: {
              select: {
                name: true
              }
            }
          }
        } : undefined
      }
    }),
    prisma.bookReview.findMany({
      where: startDate || endDate ? { createdAt: dateFilter } : {},
      select: {
        bookId: true,
        rating: true,
        book: includeDetails ? {
          select: {
            id: true,
            title: true,
            authors: true
          }
        } : undefined
      }
    }),
    prisma.userBookList.findMany({
      where: startDate || endDate ? { addedAt: dateFilter } : {},
      select: {
        bookId: true,
        listType: true,
        book: includeDetails ? {
          select: {
            id: true,
            title: true,
            authors: true
          }
        } : undefined
      }
    })
  ]);
  
  // Combine all book activities
  const bookActivities: Record<string, {
    book: any;
    loanCount: number;
    reviewCount: number;
    listCount: number;
    readingListCount: number;
    wishListCount: number;
    totalActivity: number;
    avgRating: number;
    popularity: number;
  }> = {};
  
  // Process loans
  loans.forEach((loan: any) => {
    const bookId = loan.bookId;
    if (!bookActivities[bookId]) {
      bookActivities[bookId] = {
        book: includeDetails ? loan.book : null,
        loanCount: 0,
        reviewCount: 0,
        listCount: 0,
        readingListCount: 0,
        wishListCount: 0,
        totalActivity: 0,
        avgRating: 0,
        popularity: 0
      };
    }
    bookActivities[bookId].loanCount++;
    bookActivities[bookId].totalActivity++;
  });
  
  // Process reviews
  const bookRatings: Record<string, { sum: number, count: number }> = {};
  reviews.forEach((review: any) => {
    const bookId = review.bookId;
    if (!bookActivities[bookId]) {
      bookActivities[bookId] = {
        book: includeDetails ? review.book : null,
        loanCount: 0,
        reviewCount: 0,
        listCount: 0,
        readingListCount: 0,
        wishListCount: 0,
        totalActivity: 0,
        avgRating: 0,
        popularity: 0
      };
    }
    bookActivities[bookId].reviewCount++;
    bookActivities[bookId].totalActivity++;
    
    // Track ratings for average calculation
    if (!bookRatings[bookId]) bookRatings[bookId] = { sum: 0, count: 0 };
    bookRatings[bookId].sum += review.rating;
    bookRatings[bookId].count++;
  });
  
  // Process lists
  lists.forEach((list: any) => {
    const bookId = list.bookId;
    if (!bookActivities[bookId]) {
      bookActivities[bookId] = {
        book: includeDetails ? list.book : null,
        loanCount: 0,
        reviewCount: 0,
        listCount: 0,
        readingListCount: 0,
        wishListCount: 0,
        totalActivity: 0,
        avgRating: 0,
        popularity: 0
      };
    }
    bookActivities[bookId].listCount++;
    
    // Count by list type
    if (list.listType === 'READING') {
      bookActivities[bookId].readingListCount++;
    } else if (list.listType === 'WISHLIST') {
      bookActivities[bookId].wishListCount++;
    }
    
    bookActivities[bookId].totalActivity++;
  });
  
  // Calculate average ratings
  Object.keys(bookRatings).forEach(bookId => {
    const rating = bookRatings[bookId];
    if (bookActivities[bookId] && rating && rating.count > 0) {
      bookActivities[bookId].avgRating = 
        parseFloat((rating.sum / rating.count).toFixed(1));
    }
  });
  
  // Get missing book data if includeDetails is true
  if (includeDetails) {
    const bookIds = Object.keys(bookActivities).filter(id => 
      bookActivities[id] && !bookActivities[id].book
    );
    
    if (bookIds.length > 0) {
      const books = await prisma.book.findMany({
        where: { id: { in: bookIds } },
        select: {
          id: true,
          title: true,
          authors: true,
          isbn: true,
          coverUrl: true,
          category: {
            select: {
              name: true
            }
          }
        }
      });
      
      books.forEach(book => {
        const activity = bookActivities[book.id];
        if (book.id && activity) {
          activity.book = book;
        }
      });
    }
  }
  
  // Calculate popularity score - weighted formula
  // 40% loans, 30% reviews, 20% wishlist adds, 10% reading list adds
  Object.values(bookActivities).forEach(book => {
    book.popularity = (
      (book.loanCount * 0.4) + 
      (book.reviewCount * 0.3) + 
      (book.wishListCount * 0.2) + 
      (book.readingListCount * 0.1)
    );
  });
  
  // Convert to array, sort by popularity, and limit
  const result = Object.values(bookActivities)
    .filter(item => includeDetails ? item.book : true)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
  
  // Format for output
  return result.map(item => ({
    id: includeDetails ? item.book.id : null,
    title: includeDetails ? item.book.title : null,
    author: includeDetails ? (item.book.authors[0] || '') : null,
    category: includeDetails && item.book.category ? item.book.category.name : null,
    coverImage: includeDetails ? item.book.coverUrl : null,
    metrics: {
      loanCount: item.loanCount,
      reviewCount: item.reviewCount,
      wishlistAdds: item.wishListCount,
      readingListAdds: item.readingListCount,
      totalActivity: item.totalActivity,
      avgRating: item.avgRating,
      popularityScore: parseFloat(item.popularity.toFixed(2))
    }
  }));
}

/**
 * Gets dashboard data combining multiple metrics for admin dashboard
 */
export async function getDashboardData() {
  // Get quick stats
  const [
    totalUsers, 
    totalBooks, 
    totalLoans, 
    activeLoans, 
    overdueLoans,
    totalReviews
  ] = await Promise.all([
    prisma.user.count(),
    prisma.book.count(),
    prisma.bookLoan.count(),
    prisma.bookLoan.count({ where: { status: LoanStatus.ACTIVE } }),
    prisma.bookLoan.count({ where: { status: LoanStatus.OVERDUE } }),
    prisma.bookReview.count()
  ]);
  
  // Get recent loans (last 10)
  const recentLoans = await prisma.bookLoan.findMany({
    take: 10,
    orderBy: { loanDate: 'desc' },
    include: {
      book: {
        select: {
          title: true,
          authors: true,
          coverUrl: true
        }
      },
      user: {
        select: {
          username: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
  
  // Get recent users (last 5)
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      firstName: true, 
      lastName: true,
      role: true,
      createdAt: true
    }
  });
  
  // Get top rated books
  const topRatedBooks = await prisma.book.findMany({
    take: 5,
    orderBy: {
      rating: 'desc'
    },
    where: {
      bookReviews: {
        some: {}
      }
    },
    select: {
      id: true,
      title: true,
      authors: true,
      coverUrl: true,
      rating: true,
      _count: {
        select: {
          bookReviews: true
        }
      }
    }
  });
  
  // Calculate monthly statistics (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyStats = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "loanDate") as month,
      COUNT(*) as count
    FROM "BookLoan"
    WHERE "loanDate" >= ${sixMonthsAgo}
    GROUP BY DATE_TRUNC('month', "loanDate")
    ORDER BY month DESC
  `;
  
  return {
    quickStats: {
      totalUsers,
      totalBooks,
      totalLoans,
      activeLoans,
      overdueLoans,
      totalReviews,
      overdueRate: totalLoans > 0 ? parseFloat((overdueLoans / totalLoans * 100).toFixed(1)) : 0
    },
    recentLoans: recentLoans.map(loan => ({
      id: loan.id,
      bookTitle: loan.book.title,
      bookAuthor: loan.book.authors[0] || '',
      coverImage: loan.book.coverUrl,
      username: loan.user.username,
      userName: `${loan.user.firstName} ${loan.user.lastName}`,
      loanDate: loan.loanDate,
      dueDate: loan.dueDate,
      status: loan.status
    })),
    recentUsers: recentUsers.map(user => ({
      id: user.id,
      username: user.username,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      joinedDate: user.createdAt
    })),
    topRatedBooks: topRatedBooks.map(book => ({
      id: book.id,
      title: book.title,
      author: book.authors[0] || '',
      coverImage: book.coverUrl,
      avgRating: book.rating,
      reviewCount: book._count.bookReviews
    })),
    monthlyStats
  };
}

// Analytics overview function for the existing endpoint
export async function analyticsOverview() {
  // Implementation of the existing analytics overview endpoint
  return {
    message: "Please use the new analytics endpoints for detailed metrics",
    endpoints: [
      "/api/admin/analytics/loans",
      "/api/admin/analytics/users/engagement",
      "/api/admin/analytics/books/popularity",
      "/api/admin/analytics/dashboard"
    ]
  };
}
