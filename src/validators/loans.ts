import { body, param, query } from 'express-validator';

export const listRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['ACTIVE', 'RETURNED', 'OVERDUE', 'LOST']),
  query('userId').optional().isString(),
  query('bookId').optional().isString(),
];

export const idParam = [param('id').isString().notEmpty()];

export const createRules = [
  body('userId').isString().notEmpty(),
  body('bookId').isString().notEmpty(),
  body('dueDate').optional().isISO8601().toDate(),
];

