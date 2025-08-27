import { body, param, query } from 'express-validator';

export const listRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString(),
  query('sortBy').optional().isIn(['createdAt', 'name']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

export const idParam = [param('id').isString().notEmpty()];

export const createRules = [
  body('name').isString().notEmpty(),
  body('description').optional({ nullable: true }).isString(),
  body('isActive').optional().isBoolean().toBoolean(),
];

export const updateRules = [
  ...idParam,
  body('name').optional().isString().notEmpty(),
  body('description').optional({ nullable: true }).isString(),
  body('isActive').optional().isBoolean().toBoolean(),
];

