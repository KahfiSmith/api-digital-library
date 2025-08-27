import { Request, Response } from 'express';
import * as Lists from '@/services/lists.service';
import { ResponseUtil } from '@/utils/response';
import { ListType } from '@prisma/client';

export async function listByType(req: Request, res: Response) {
  const uid = req.user?.userId as string;
  const { listType } = req.params as { listType: ListType };
  const { page, limit } = req.query as any;
  const result = await Lists.listByType(uid, listType, { page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined });
  return ResponseUtil.paginated(res, 'List items fetched', result.items, result.pagination);
}

export async function listAll(req: Request, res: Response) {
  const uid = req.user?.userId as string;
  const data = await Lists.listAll(uid);
  return ResponseUtil.success(res, 'All lists fetched', data);
}

export async function add(req: Request, res: Response) {
  const uid = req.user?.userId as string;
  const { listType } = req.params as { listType: ListType };
  const { bookId } = req.body as { bookId: string };
  const entry = await Lists.add(uid, bookId, listType);
  return ResponseUtil.success(res, 'Added to list', entry, 201);
}

export async function remove(req: Request, res: Response) {
  const uid = req.user?.userId as string;
  const { listType, bookId } = req.params as { listType: ListType; bookId: string };
  await Lists.remove(uid, bookId, listType);
  return ResponseUtil.success(res, 'Removed from list', { bookId, listType });
}

