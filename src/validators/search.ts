import { query } from 'express-validator';

export const searchBooksRules = [
  query('query').isString().trim().notEmpty(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('language').optional().isString(),
  query('categoryId').optional().isString(),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
  query('maxRating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
  query('start').optional().isISO8601().toDate(),
  query('end').optional().isISO8601().toDate(),
  query('sortBy').optional().isIn(['rating', 'createdAt', 'title']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];
