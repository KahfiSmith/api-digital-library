import { Request, Response } from 'express';
import * as Users from '@/services/users.service';
import { ResponseUtil } from '@/utils/response';
import { publicUrlFrom } from '@/utils/storage';

export async function getProfile(req: Request, res: Response) {
  const uid = req.user?.userId as string;
  const user = await Users.getProfile(uid);
  return ResponseUtil.success(res, 'Profile fetched', user);
}

export async function updateProfile(req: Request, res: Response) {
  const uid = req.user?.userId as string;
  const user = await Users.updateProfile(uid, req.body);
  return ResponseUtil.success(res, 'Profile updated', user);
}

export async function updateAvatar(req: Request, res: Response) {
  const uid = req.user?.userId as string;
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return ResponseUtil.error(res, 'No file uploaded', 400);
  }
  const relPath = file.path.replace(/^[.\\/]+/, '').replace(/\\/g, '/');
  const url = publicUrlFrom(relPath);
  const user = await Users.updateProfile(uid, { avatarUrl: url });
  return ResponseUtil.success(res, 'Avatar updated', { user, url });
}

export async function changePassword(req: Request, res: Response) {
  const uid = req.user?.userId as string;
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  await Users.changePassword(uid, currentPassword, newPassword);
  return ResponseUtil.success(res, 'Password changed');
}

export async function list(req: Request, res: Response) {
  const { page, limit, search, sortBy, sortOrder } = req.query as any;
  const result = await Users.list({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search as string | undefined,
    sortBy: sortBy as any,
    sortOrder: sortOrder as any,
  });
  return ResponseUtil.paginated(res, 'Users fetched', result.items, result.pagination);
}

export async function getById(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const user = await Users.getById(id);
  return ResponseUtil.success(res, 'User fetched', user);
}
