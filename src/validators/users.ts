import { body, param, query } from 'express-validator';

export const listRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString(),
  query('sortBy').optional().isIn(['createdAt', 'username', 'firstName', 'lastName']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

export const idParam = [param('id').isString().notEmpty()];

export const updateProfileRules = [
  body('firstName').optional().isString().notEmpty(),
  body('lastName').optional().isString().notEmpty(),
  body('avatarUrl').optional({ nullable: true }).isString(),
];

export const changePasswordRules = [
  body('currentPassword').isString().isLength({ min: 8 }),
  body('newPassword').isString().isLength({ min: 8 }),
];
