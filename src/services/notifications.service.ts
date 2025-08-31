import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/appError';
import { NotificationType } from '@/types/enums';

export interface NotificationQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
}

export async function create(input: CreateNotificationInput) {
  const notification = await (prisma as any).notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata,
    },
  });
  return notification;
}

export async function createBulk(notifications: CreateNotificationInput[]) {
  const result = await (prisma as any).notification.createMany({
    data: notifications,
  });
  return result;
}

export async function list(userId: string, query: NotificationQuery) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (query.unreadOnly) {
    where.isRead = false;
  }

  const [items, total] = await Promise.all([
    (prisma as any).notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    (prisma as any).notification.count({ where }),
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

export async function markAsRead(userId: string, notificationId: string) {
  const notification = await (prisma as any).notification.findFirst({
    where: { id: notificationId, userId },
  });
  
  if (!notification) {
    throw AppError.notFound('Notification not found');
  }

  const updated = await (prisma as any).notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return updated;
}

export async function markAllAsRead(userId: string) {
  const result = await (prisma as any).notification.updateMany({
    where: { userId, isRead: false },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return { updatedCount: result.count };
}

export async function getUnreadCount(userId: string) {
  const count = await (prisma as any).notification.count({
    where: { userId, isRead: false },
  });
  return { count };
}

export async function remove(userId: string, notificationId: string) {
  const notification = await (prisma as any).notification.findFirst({
    where: { id: notificationId, userId },
  });
  
  if (!notification) {
    throw AppError.notFound('Notification not found');
  }

  await (prisma as any).notification.delete({
    where: { id: notificationId },
  });

  return { success: true };
}

export async function removeAll(userId: string) {
  const result = await (prisma as any).notification.deleteMany({
    where: { userId },
  });

  return { deletedCount: result.count };
}

// Helper functions for creating specific notification types
export async function notifyBookDue(userId: string, bookTitle: string, dueDate: Date, loanId: string) {
  return create({
    userId,
    type: NotificationType.BOOK_DUE_REMINDER,
    title: 'Book Due Soon',
    message: `"${bookTitle}" is due on ${dueDate.toDateString()}. Please return it on time.`,
    metadata: { loanId, bookTitle, dueDate },
  });
}

export async function notifyBookOverdue(userId: string, bookTitle: string, daysOverdue: number, loanId: string) {
  return create({
    userId,
    type: NotificationType.BOOK_OVERDUE,
    title: 'Book Overdue',
    message: `"${bookTitle}" is ${daysOverdue} day(s) overdue. Please return it immediately to avoid additional fines.`,
    metadata: { loanId, bookTitle, daysOverdue },
  });
}

export async function notifyNewBook(bookTitle: string, categoryName: string) {
  // Notify all users who have books in this category in their wishlist
  const usersToNotify = await prisma.userBookList.findMany({
    where: {
      listType: 'WISHLIST' as any,
      book: { category: { name: categoryName } },
    },
    select: { userId: true },
    distinct: ['userId'],
  });

  const notifications = usersToNotify.map(({ userId }) => ({
    userId,
    type: NotificationType.NEW_BOOK_AVAILABLE,
    title: 'New Book Available',
    message: `A new book "${bookTitle}" is now available in the ${categoryName} category.`,
    metadata: { bookTitle, categoryName },
  }));

  if (notifications.length > 0) {
    return createBulk(notifications);
  }
  
  return { count: 0 };
}

export async function notifySystemAnnouncement(title: string, message: string) {
  // Get all active users
  const activeUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const notifications = activeUsers.map(user => ({
    userId: user.id,
    type: NotificationType.SYSTEM_ANNOUNCEMENT,
    title,
    message,
    metadata: {},
  }));

  if (notifications.length > 0) {
    return createBulk(notifications);
  }

  return { count: 0 };
}