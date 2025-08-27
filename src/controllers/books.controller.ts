import { Request, Response } from 'express';
import * as Books from '@/services/books.service';
import { ResponseUtil } from '@/utils/response';
import { publicUrlFrom } from '@/utils/storage';

export async function list(req: Request, res: Response) {
  const { page, limit, search, categoryId, sortBy, sortOrder } = req.query as any;
  const result = await Books.list({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search as string | undefined,
    categoryId: categoryId as string | undefined,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any,
  });
  return ResponseUtil.paginated(res, 'Books fetched', result.items, result.pagination);
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const book = await Books.getById(id);
  return ResponseUtil.success(res, 'Book fetched', book);
}

export async function create(req: Request, res: Response) {
  const book = await Books.create(req.body);
  return ResponseUtil.success(res, 'Book created', book, 201);
}

export async function update(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const book = await Books.update(id, req.body);
  return ResponseUtil.success(res, 'Book updated', book);
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await Books.remove(id);
  return ResponseUtil.success(res, 'Book deleted', { id });
}

export async function updateCover(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return ResponseUtil.error(res, 'No file uploaded', 400);
  const relPath = file.path.replace(/^[.\\/]+/, '').replace(/\\/g, '/');
  const url = publicUrlFrom(relPath);
  const book = await Books.update(id, { coverUrl: url });
  return ResponseUtil.success(res, 'Cover updated', { book, url });
}

export async function updatePdf(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return ResponseUtil.error(res, 'No file uploaded', 400);
  const relPath = file.path.replace(/^[.\\/]+/, '').replace(/\\/g, '/');
  const url = publicUrlFrom(relPath);
  const book = await Books.update(id, { pdfUrl: url });
  return ResponseUtil.success(res, 'PDF updated', { book, url });
}
