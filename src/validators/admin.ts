import { param, query, body } from 'express-validator';

export const listUsersRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('role').optional().isIn(['ADMIN', 'LIBRARIAN', 'USER']),
  query('isActive').optional().isBoolean().toBoolean(),
  query('search').optional().isString(),
];

export const idParam = [param('id').isString().notEmpty()];

export const updateStatusRules = [
  ...idParam,
  body('isActive').isBoolean().toBoolean(),
];

export const recentRules = [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const setPasswordRules = [
  ...idParam,
  body('newPassword').isString().isLength({ min: 8 }),
];

export const exportRules = [];

export const updateRoleRules = [
  ...idParam,
  body('role').isIn(['ADMIN', 'LIBRARIAN', 'USER']),
];

export const analyticsTimeseriesRules = [
  query('days').optional().isInt({ min: 1, max: 365 }).toInt(),
];

export const topLimitRules = [
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];
