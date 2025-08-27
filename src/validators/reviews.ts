import { body, param, query } from 'express-validator';

export const listQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const idParam = [param('id').isString().notEmpty()];
export const userIdParam = [param('userId').isString().notEmpty()];

export const createRules = [
  body('bookId').isString().notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }).toInt(),
  body('reviewText').optional({ nullable: true }).isString(),
  body('isPublic').optional().isBoolean().toBoolean(),
];

export const updateRules = [
  ...idParam,
  body('rating').optional().isInt({ min: 1, max: 5 }).toInt(),
  body('reviewText').optional({ nullable: true }).isString(),
  body('isPublic').optional().isBoolean().toBoolean(),
];

