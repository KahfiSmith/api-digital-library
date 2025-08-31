import { Router } from 'express';
import * as EmailController from '@/controllers/email.controller';
import { authenticateJWT, requireRoles } from '@/middleware/auth';
import { body } from 'express-validator';
import { validateRequest } from '@/middleware/validate';

const router: Router = Router();

// Test email configuration (Admin only)
router.post('/test',
  authenticateJWT,
  requireRoles('ADMIN'),
  EmailController.sendTestEmail
);

// Manual email triggers (Admin/Librarian only)
router.post('/due-date-reminders',
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  EmailController.sendDueDateReminders
);

router.post('/overdue-notifications',
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  EmailController.sendOverdueNotifications
);

router.post('/new-book-notifications',
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  [
    body('bookId')
      .notEmpty()
      .withMessage('Book ID is required')
      .isString()
      .withMessage('Book ID must be a string')
  ],
  validateRequest,
  EmailController.sendNewBookNotifications
);

router.post('/system-announcement',
  authenticateJWT,
  requireRoles('ADMIN'),
  [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isString()
      .withMessage('Title must be a string')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isString()
      .withMessage('Message must be a string')
      .isLength({ max: 5000 })
      .withMessage('Message cannot exceed 5000 characters'),
    body('targetUserIds')
      .optional()
      .isArray()
      .withMessage('Target user IDs must be an array')
  ],
  validateRequest,
  EmailController.sendSystemAnnouncement
);

router.post('/reservation-ready',
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  [
    body('reservationId')
      .notEmpty()
      .withMessage('Reservation ID is required')
      .isString()
      .withMessage('Reservation ID must be a string')
  ],
  validateRequest,
  EmailController.sendReservationReadyNotification
);

router.post('/welcome',
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  [
    body('userId')
      .notEmpty()
      .withMessage('User ID is required')
      .isString()
      .withMessage('User ID must be a string')
  ],
  validateRequest,
  EmailController.sendWelcomeEmail
);

// Run daily email tasks (Admin only)
router.post('/daily-tasks',
  authenticateJWT,
  requireRoles('ADMIN'),
  EmailController.runDailyTasks
);

// User preferences (Authenticated users)
router.get('/preferences',
  authenticateJWT,
  EmailController.getUserEmailPreferences
);

export default router;