import { body, param, query } from 'express-validator';
import { NotificationType } from '@/types/enums';

const notificationTypes = Object.values(NotificationType);

export const listQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('unreadOnly').optional().isBoolean().toBoolean(),
];

export const idParam = [
  param('id').isString().notEmpty()
];

export const systemAnnouncementRules = [
  body('title').isString().isLength({ min: 1, max: 200 }),
  body('message').isString().isLength({ min: 1, max: 1000 }),
];

export const customNotificationRules = [
  body('userId').isString().notEmpty(),
  body('type').isIn(notificationTypes),
  body('title').isString().isLength({ min: 1, max: 200 }),
  body('message').isString().isLength({ min: 1, max: 1000 }),
  body('metadata').optional().isObject(),
];