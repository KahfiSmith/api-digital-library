import { Request, Response } from 'express';
import * as Reviews from '@/services/reviews.service';
import { ResponseUtil } from '@/utils/response';
import { AppError } from '@/utils/appError';

export async function listByBook(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const { page, limit } = req.query as any;
  const result = await Reviews.listByBook(id, { page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined });
  return ResponseUtil.paginated(res, 'Reviews fetched', result.items, result.pagination);
}

export async function listByUser(req: Request, res: Response) {
  const { userId } = req.params as { userId: string };
  const requester = req.user?.userId;
  const role = req.user?.role;
  if (!role || role === 'USER') {
    if (!requester || requester !== userId) throw AppError.forbidden('Cannot view reviews for another user');
  }
  const { page, limit } = req.query as any;
  const result = await Reviews.listByUser(userId, { page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined });
  return ResponseUtil.paginated(res, 'User reviews fetched', result.items, result.pagination);
}

export async function create(req: Request, res: Response) {
  const uid = req.user?.userId as string;
  const { bookId, rating, reviewText, isPublic } = req.body as { bookId: string; rating: number; reviewText?: string; isPublic?: boolean };
  const review = await Reviews.create(uid, { bookId, rating, reviewText, isPublic });
  return ResponseUtil.success(res, 'Review created', review, 201);
}

export async function update(req: Request, res: Response) {
  const uid = req.user?.userId as string;
  const role = req.user?.role;
  const { id } = req.params as { id: string };
  const existing = await Reviews.getById(id);
  if ((!role || role === 'USER') && existing.userId !== uid) {
    throw AppError.forbidden('Cannot edit another user\'s review');
  }
  const { rating, reviewText, isPublic } = req.body as { rating?: number; reviewText?: string; isPublic?: boolean };
  const updated = await Reviews.update(id, { rating, reviewText, isPublic });
  return ResponseUtil.success(res, 'Review updated', updated);
}

export async function remove(req: Request, res: Response) {
  const uid = req.user?.userId as string;
  const role = req.user?.role;
  const { id } = req.params as { id: string };
  const existing = await Reviews.getById(id);
  if ((!role || role === 'USER') && existing.userId !== uid) {
    throw AppError.forbidden('Cannot delete another user\'s review');
  }
  await Reviews.remove(id);
  return ResponseUtil.success(res, 'Review deleted', { id });
}

