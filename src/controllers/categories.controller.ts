import { Request, Response } from 'express';
import * as Categories from '@/services/categories.service';
import { ResponseUtil } from '@/utils/response';

export async function list(req: Request, res: Response) {
  const { page, limit, search, sortBy, sortOrder } = req.query as any;
  const result = await Categories.list({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search as string | undefined,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any,
  });
  return ResponseUtil.paginated(res, 'Categories fetched', result.items, result.pagination);
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const category = await Categories.getById(id);
  return ResponseUtil.success(res, 'Category fetched', category);
}

export async function create(req: Request, res: Response) {
  const category = await Categories.create(req.body);
  return ResponseUtil.success(res, 'Category created', category, 201);
}

export async function update(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const category = await Categories.update(id, req.body);
  return ResponseUtil.success(res, 'Category updated', category);
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await Categories.remove(id);
  return ResponseUtil.success(res, 'Category deleted', { id });
}

