import { Request, Response } from 'express';
import * as Admin from '@/services/admin.service';
import { ResponseUtil } from '@/utils/response';
import { toCsv, sendCsv } from '@/utils/csv';

export async function stats(req: Request, res: Response) {
  const data = await Admin.getStats();
  return ResponseUtil.success(res, 'System stats', data);
}

export async function listUsers(req: Request, res: Response) {
  const { page, limit, role, isActive, search } = req.query as any;
  const result = await Admin.listUsers({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    role: role as any,
    isActive: typeof isActive !== 'undefined' ? isActive === 'true' : undefined,
    search: search as string | undefined,
  });
  return ResponseUtil.paginated(res, 'Users fetched', result.items, result.pagination);
}

export async function updateUserStatus(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const { isActive } = req.body as { isActive: boolean };
  const user = await Admin.updateUserStatus(id, Boolean(isActive));
  return ResponseUtil.success(res, 'User status updated', user);
}

export async function recent(req: Request, res: Response) {
  const { limit } = req.query as any;
  const data = await Admin.recentActivity(limit ? Number(limit) : 10);
  return ResponseUtil.success(res, 'Recent activity', data);
}

export async function setUserPassword(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const { newPassword } = req.body as { newPassword: string };
  // Delegate to users service for hashing
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  const bcrypt = await import('bcrypt');
  const passwordHash = await bcrypt.hash(newPassword, rounds);
  const user = await (await import('@/database/prisma')).prisma.user.update({ where: { id }, data: { passwordHash } });
  return ResponseUtil.success(res, 'User password updated', { id: user.id });
}

export async function updateUserRole(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const { role } = req.body as { role: 'ADMIN' | 'LIBRARIAN' | 'USER' };
  // Prevent self-demotion/promotion confusion: allow, but guard if needed
  const user = await Admin.updateUserRole(id, role as any);
  return ResponseUtil.success(res, 'User role updated', user);
}

export async function exportUsersCsv(req: Request, res: Response) {
  const { items } = await Admin.listUsers({ page: 1, limit: 1000 });
  const csv = toCsv(items as any[]);
  sendCsv(res, 'users.csv', csv);
}

export async function exportBooksCsv(_req: Request, res: Response) {
  const books = await (await import('@/database/prisma')).prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
  const csv = toCsv(books as any[]);
  sendCsv(res, 'books.csv', csv);
}

export async function exportLoansCsv(_req: Request, res: Response) {
  const loans = await (await import('@/database/prisma')).prisma.bookLoan.findMany({ orderBy: { createdAt: 'desc' } });
  const csv = toCsv(loans as any[]);
  sendCsv(res, 'loans.csv', csv);
}

export async function analyticsOverview(_req: Request, res: Response) {
  const data = await Admin.analyticsOverview();
  return ResponseUtil.success(res, 'Analytics overview', data);
}

export async function analyticsTimeseries(req: Request, res: Response) {
  const { days } = req.query as any;
  const data = await Admin.analyticsTimeseries(days ? Number(days) : 30);
  return ResponseUtil.success(res, 'Analytics timeseries', data);
}

export async function analyticsTopBooks(req: Request, res: Response) {
  const { limit } = req.query as any;
  const data = await Admin.topBooks(limit ? Number(limit) : 5);
  return ResponseUtil.success(res, 'Top books', data);
}

export async function analyticsTopCategories(req: Request, res: Response) {
  const { limit } = req.query as any;
  const data = await Admin.topCategories(limit ? Number(limit) : 5);
  return ResponseUtil.success(res, 'Top categories', data);
}
