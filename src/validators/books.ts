import { body, param, query } from 'express-validator';

export const listRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'title', 'rating']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('search').optional().isString(),
  query('categoryId').optional().isString(),
];

export const idParam = [param('id').isString().notEmpty()];

export const createRules = [
  body('title').isString().notEmpty(),
  body('authors').isArray({ min: 1 }),
  body('authors.*').isString().notEmpty(),
  body('categoryId').isString().notEmpty(),
  body('isbn').optional({ nullable: true }).isString(),
  body('subtitle').optional({ nullable: true }).isString(),
  body('description').optional({ nullable: true }).isString(),
  body('publisher').optional({ nullable: true }).isString(),
  body('publishedDate').optional({ nullable: true }).isISO8601().toDate(),
  body('pageCount').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('language').optional({ nullable: true }).isString(),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString(),
];

export const updateRules = [
  ...idParam,
  body('title').optional().isString().notEmpty(),
  body('authors').optional().isArray({ min: 1 }),
  body('authors.*').optional().isString().notEmpty(),
  body('categoryId').optional().isString().notEmpty(),
  body('isbn').optional({ nullable: true }).isString(),
  body('subtitle').optional({ nullable: true }).isString(),
  body('description').optional({ nullable: true }).isString(),
  body('publisher').optional({ nullable: true }).isString(),
  body('publishedDate').optional({ nullable: true }).isISO8601().toDate(),
  body('pageCount').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('language').optional({ nullable: true }).isString(),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString(),
];

