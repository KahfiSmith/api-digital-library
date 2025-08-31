import { Request, Response } from 'express';
import * as NotificationsService from '@/services/notifications.service';
import { ResponseUtil } from '@/utils/response';
import { NotificationType } from '@/types/enums';

export async function list(req: Request, res: Response) {
  const userId = req.user?.userId as string;
  const { page, limit, unreadOnly } = req.query as any;
  
  const result = await NotificationsService.list(userId, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    unreadOnly: unreadOnly === 'true',
  });
  
  return ResponseUtil.paginated(res, 'Notifications fetched', result.items, result.pagination);
}

export async function markAsRead(req: Request, res: Response) {
  const userId = req.user?.userId as string;
  const { id } = req.params as { id: string };
  
  const notification = await NotificationsService.markAsRead(userId, id);
  return ResponseUtil.success(res, 'Notification marked as read', notification);
}

export async function markAllAsRead(req: Request, res: Response) {
  const userId = req.user?.userId as string;
  
  const result = await NotificationsService.markAllAsRead(userId);
  return ResponseUtil.success(res, 'All notifications marked as read', result);
}

export async function getUnreadCount(req: Request, res: Response) {
  const userId = req.user?.userId as string;
  
  const result = await NotificationsService.getUnreadCount(userId);
  return ResponseUtil.success(res, 'Unread count fetched', result);
}

export async function remove(req: Request, res: Response) {
  const userId = req.user?.userId as string;
  const { id } = req.params as { id: string };
  
  await NotificationsService.remove(userId, id);
  return ResponseUtil.success(res, 'Notification deleted', { id });
}

export async function removeAll(req: Request, res: Response) {
  const userId = req.user?.userId as string;
  
  const result = await NotificationsService.removeAll(userId);
  return ResponseUtil.success(res, 'All notifications deleted', result);
}

// Admin/Librarian functions
export async function createSystemAnnouncement(req: Request, res: Response) {
  const { title, message } = req.body as { title: string; message: string };
  
  const result = await NotificationsService.notifySystemAnnouncement(title, message);
  return ResponseUtil.success(res, 'System announcement sent', result, 201);
}

export async function createCustomNotification(req: Request, res: Response) {
  const { userId, type, title, message, metadata } = req.body as {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
  };
  
  const notification = await NotificationsService.create({
    userId,
    type,
    title,
    message,
    metadata,
  });
  
  return ResponseUtil.success(res, 'Notification created', notification, 201);
}