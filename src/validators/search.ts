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
  query('sortBy').optional().isIn(['rating', 'createdAt', 'title', 'publishedDate', 'availability']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('availability').optional().isIn(['available', 'unavailable']),
  query('hasReviews').optional().isIn(['true', 'false']),
];

export const searchCategoriesRules = [
  query('query').isString().trim().notEmpty(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

export const searchUsersRules = [
  query('query').isString().trim().notEmpty(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('role').optional().isIn(['USER', 'ADMIN', 'LIBRARIAN']),
];

export const globalSearchRules = [
  query('query').isString().trim().notEmpty(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 20 }).toInt(),
  query('types').optional().isString(),
];