import { Request, Response } from 'express';
import * as emailService from '@/services/email.service';
import { ResponseUtil } from '@/utils/response';
import { AppError } from '@/utils/appError';

export async function sendTestEmail(req: Request, res: Response) {
  const success = await emailService.testEmailConfiguration();
  
  if (success) {
    return ResponseUtil.success(res, 'Test email sent successfully', { sent: true });
  } else {
    return ResponseUtil.error(res, 'Failed to send test email', 500);
  }
}

export async function sendDueDateReminders(req: Request, res: Response) {
  const sent = await emailService.sendDueDateReminders();
  
  return ResponseUtil.success(res, 'Due date reminders sent', { sent });
}

export async function sendOverdueNotifications(req: Request, res: Response) {
  const sent = await emailService.sendOverdueNotifications();
  
  return ResponseUtil.success(res, 'Overdue notifications sent', { sent });
}

export async function sendNewBookNotifications(req: Request, res: Response) {
  const { bookId } = req.body;
  
  if (!bookId) {
    throw AppError.badRequest('Book ID is required');
  }
  
  const sent = await emailService.sendNewBookNotifications(bookId);
  
  return ResponseUtil.success(res, 'New book notifications sent', { sent });
}

export async function sendSystemAnnouncement(req: Request, res: Response) {
  const { title, message, targetUserIds } = req.body;
  
  if (!title || !message) {
    throw AppError.badRequest('Title and message are required');
  }
  
  const sent = await emailService.sendSystemAnnouncement(title, message, targetUserIds);
  
  return ResponseUtil.success(res, 'System announcement sent', { sent });
}

export async function sendReservationReadyNotification(req: Request, res: Response) {
  const { reservationId } = req.body;
  
  if (!reservationId) {
    throw AppError.badRequest('Reservation ID is required');
  }
  
  const sent = await emailService.sendReservationReadyNotification(reservationId);
  
  return ResponseUtil.success(res, 'Reservation ready notification sent', { sent });
}

export async function sendWelcomeEmail(req: Request, res: Response) {
  const { userId } = req.body;
  
  if (!userId) {
    throw AppError.badRequest('User ID is required');
  }
  
  const sent = await emailService.sendWelcomeEmail(userId);
  
  return ResponseUtil.success(res, 'Welcome email sent', { sent });
}

export async function runDailyTasks(req: Request, res: Response) {
  await emailService.runDailyEmailTasks();
  
  return ResponseUtil.success(res, 'Daily email tasks completed', { completed: true });
}

export async function getUserEmailPreferences(req: Request, res: Response) {
  const userId = req.user!.id;
  
  const preferences = await emailService.getUserEmailPreferences(userId);
  
  return ResponseUtil.success(res, 'Email preferences retrieved', preferences);
}