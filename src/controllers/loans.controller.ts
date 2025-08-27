import { Request, Response } from 'express';
import * as Loans from '@/services/loans.service';
import { ResponseUtil } from '@/utils/response';
import { AppError } from '@/utils/appError';
import { LoanStatus } from '@prisma/client';

export async function list(req: Request, res: Response) {
  const { page, limit, status, userId, bookId } = req.query as any;
  const result = await Loans.list({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as LoanStatus | undefined,
    userId: userId as string | undefined,
    bookId: bookId as string | undefined,
  });
  return ResponseUtil.paginated(res, 'Loans fetched', result.items, result.pagination);
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const loan = await Loans.getById(id);
  return ResponseUtil.success(res, 'Loan fetched', loan);
}

export async function create(req: Request, res: Response) {
  const { userId, bookId, dueDate } = req.body as { userId: string; bookId: string; dueDate?: string };

  // If regular user, ensure they can only create for themselves
  const role = req.user?.role;
  const requester = req.user?.userId;
  if (!role || role === 'USER') {
    if (!requester || requester !== userId) throw AppError.forbidden('Cannot create loan for other users');
  }

  const loan = await Loans.create({ userId, bookId, dueDate: dueDate ? new Date(dueDate) : undefined });
  return ResponseUtil.success(res, 'Loan created', loan, 201);
}

export async function returnLoan(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const loan = await Loans.getById(id);

  // Regular users can only return their own loans
  const role = req.user?.role;
  const requester = req.user?.userId;
  if (!role || role === 'USER') {
    if (!requester || requester !== loan.userId) throw AppError.forbidden('Cannot return a loan for another user');
  }

  const updated = await Loans.returnLoan(id);
  return ResponseUtil.success(res, 'Loan returned', updated);
}

export async function listByUser(req: Request, res: Response) {
  const { userId } = req.params as { userId: string };

  // Regular users can only view their own loans
  const role = req.user?.role;
  const requester = req.user?.userId;
  if (!role || role === 'USER') {
    if (!requester || requester !== userId) throw AppError.forbidden('Cannot view loans for another user');
  }

  const { page, limit, status } = req.query as any;
  const result = await Loans.list({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as LoanStatus | undefined,
    userId,
  });
  return ResponseUtil.paginated(res, 'User loans fetched', result.items, result.pagination);
}

