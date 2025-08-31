import { Request, Response } from 'express';
import * as Admin from '@/services/admin.service';
import { ResponseUtil } from '@/utils/response';
import { toCsv, sendCsv } from '@/utils/csv';
import * as bcrypt from 'bcrypt';

export async function getStats(req: Request, res: Response) {
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
  const passwordHash = await bcrypt.hash(newPassword, rounds);
  const user = await (await import('@/database/prisma')).prisma.user.update({ 
    where: { id }, 
    data: { passwordHash } 
  });
  return ResponseUtil.success(res, 'User password updated', { id: user.id });
}

export async function updateUserRole(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const { role } = req.body as { role: 'ADMIN' | 'LIBRARIAN' | 'USER' };
  // Prevent self-demotion/promotion confusion: allow, but guard if needed
  const user = await Admin.updateUserRole(id, role as any);
  return ResponseUtil.success(res, 'User role updated', user);
}

// CSV Export endpoints
export async function exportUsersCsv(req: Request, res: Response) {
  const users = await Admin.listUsers({ limit: 1000 });
  const csv = toCsv(users.items);
  return sendCsv(res, 'users.csv', csv);
}

export async function exportBooksCsv(req: Request, res: Response) {
  const books = await (await import('@/services/books.service')).list({ limit: 1000 });
  const csv = toCsv(books.items);
  return sendCsv(res, 'books.csv', csv);
}

export async function exportLoansCsv(req: Request, res: Response) {
  const loans = await (await import('@/services/loans.service')).list({ limit: 1000 });
  const csv = toCsv(loans.items);
  return sendCsv(res, 'loans.csv', csv);
}

// Analytics overview endpoint
export async function analyticsOverview(req: Request, res: Response) {
  const data = await Admin.analyticsOverview();
  return ResponseUtil.success(res, 'Analytics overview', data);
}

// New analytics endpoints
export async function getLoanStatistics(req: Request, res: Response) {
  const { startDate, endDate, categoryId } = req.query;
  const data = await Admin.getLoanStatistics({
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    categoryId: categoryId as string,
  });
  return ResponseUtil.success(res, 'Loan statistics retrieved successfully', data);
}

export async function getUserEngagement(req: Request, res: Response) {
  const { startDate, endDate, minActivityCount } = req.query;
  const data = await Admin.getUserEngagement({
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    minActivityCount: minActivityCount ? Number(minActivityCount) : undefined,
  });
  return ResponseUtil.success(res, 'User engagement data retrieved successfully', data);
}

export async function getBookPopularityMetrics(req: Request, res: Response) {
  const { startDate, endDate, limit, includeDetails } = req.query;
  const data = await Admin.getBookPopularityMetrics({
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    limit: limit ? Number(limit) : undefined,
    includeDetails: includeDetails === 'true',
  });
  return ResponseUtil.success(res, 'Book popularity metrics retrieved successfully', data);
}

export async function getDashboardData(req: Request, res: Response) {
  const data = await Admin.getDashboardData();
  return ResponseUtil.success(res, 'Dashboard data retrieved successfully', data);
}
