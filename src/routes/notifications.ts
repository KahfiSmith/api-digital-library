import { Router } from 'express';
import * as NotificationsController from '@/controllers/notifications.controller';
import { authenticateJWT, requireRoles } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import { 
  listQuery, 
  idParam, 
  systemAnnouncementRules, 
  customNotificationRules 
} from '@/validators/notifications';

const router: Router = Router();

router.use(authenticateJWT);

// Get user notifications
router.get('/', listQuery, validateRequest, NotificationsController.list);

// Get unread count
router.get('/unread-count', NotificationsController.getUnreadCount);

// Mark notification as read
router.patch('/:id/read', idParam, validateRequest, NotificationsController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', NotificationsController.markAllAsRead);

// Delete notification
router.delete('/:id', idParam, validateRequest, NotificationsController.remove);

// Delete all notifications
router.delete('/', NotificationsController.removeAll);

// Admin/Librarian only routes
router.post('/system-announcement', 
  requireRoles('ADMIN', 'LIBRARIAN'), 
  systemAnnouncementRules, 
  validateRequest, 
  NotificationsController.createSystemAnnouncement
);

router.post('/custom', 
  requireRoles('ADMIN', 'LIBRARIAN'), 
  customNotificationRules, 
  validateRequest, 
  NotificationsController.createCustomNotification
);

export default router;