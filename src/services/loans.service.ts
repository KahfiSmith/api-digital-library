import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/appError';
import { LoanStatus } from '@prisma/client';

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

