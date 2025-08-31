import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/appError';
import { LoanStatus } from '@/types/enums';
import * as NotificationsService from './notifications.service';

export interface ListQuery {
  page?: number;
  limit?: number;
  status?: LoanStatus;
  userId?: string;
  bookId?: string;
}

export async function list(query: ListQuery) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.userId) where.userId = query.userId;
  if (query.bookId) where.bookId = query.bookId;

  const [items, total] = await Promise.all([
    prisma.bookLoan.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.bookLoan.count({ where }),
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
  const loan = await prisma.bookLoan.findUnique({ where: { id } });
  if (!loan) throw AppError.notFound('Loan not found');
  return loan;
}

export async function create(input: { userId: string; bookId: string; dueDate?: Date }) {
  const book = await prisma.book.findUnique({ where: { id: input.bookId } });
  if (!book || !book.isActive) throw AppError.notFound('Book not found');
  if (book.availableCopies <= 0) throw AppError.badRequest('No available copies for this book');

  const existingActive = await prisma.bookLoan.findFirst({
    where: { userId: input.userId, bookId: input.bookId, status: LoanStatus.ACTIVE },
  });
  if (existingActive) throw AppError.badRequest('You already have an active loan for this book');

  const dueDate = input.dueDate ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const [loan] = await prisma.$transaction([
    prisma.bookLoan.create({
      data: {
        userId: input.userId,
        bookId: input.bookId,
        dueDate,
        status: LoanStatus.ACTIVE,
      },
    }),
    prisma.book.update({
      where: { id: input.bookId },
      data: { availableCopies: { increment: -1 } },
    }),
  ]);

  return loan;
}

export async function returnLoan(id: string) {
  const loan = await prisma.bookLoan.findUnique({ where: { id } });
  if (!loan) throw AppError.notFound('Loan not found');
  if (loan.status !== LoanStatus.ACTIVE) throw AppError.badRequest('Loan is not active');

  const [updated] = await prisma.$transaction([
    prisma.bookLoan.update({
      where: { id },
      data: { status: LoanStatus.RETURNED, returnDate: new Date() },
    }),
    prisma.book.update({ where: { id: loan.bookId }, data: { availableCopies: { increment: 1 } } }),
  ]);

  return updated;
}

// Notification integration functions
export async function checkDueLoans() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dueLoans = await prisma.bookLoan.findMany({
    where: {
      status: LoanStatus.ACTIVE,
      dueDate: {
        gte: new Date(),
        lte: tomorrow,
      },
    },
    include: {
      user: true,
      book: true,
    },
  });

  // Send due reminders
  for (const loan of dueLoans) {
    try {
      await NotificationsService.notifyBookDue(
        loan.userId,
        loan.book.title,
        loan.dueDate,
        loan.id
      );
    } catch (error) {
      console.error(`Failed to send due reminder for loan ${loan.id}:`, error);
    }
  }

  return { notificationsSent: dueLoans.length };
}

export async function checkOverdueLoans() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueLoans = await prisma.bookLoan.findMany({
    where: {
      status: LoanStatus.ACTIVE,
      dueDate: {
        lt: today,
      },
    },
    include: {
      user: true,
      book: true,
    },
  });

  // Update overdue status and send notifications
  for (const loan of overdueLoans) {
    try {
      // Update loan status to overdue
      await prisma.bookLoan.update({
        where: { id: loan.id },
        data: { status: LoanStatus.OVERDUE },
      });

      // Calculate overdue days
      const daysOverdue = Math.ceil((today.getTime() - loan.dueDate.getTime()) / (1000 * 3600 * 24));

      // Send overdue notification
      await NotificationsService.notifyBookOverdue(
        loan.userId,
        loan.book.title,
        daysOverdue,
        loan.id
      );
    } catch (error) {
      console.error(`Failed to process overdue loan ${loan.id}:`, error);
    }
  }

  return { loansProcessed: overdueLoans.length };
}

