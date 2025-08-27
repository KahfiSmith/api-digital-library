import { body, param, query } from 'express-validator';

const listTypes = ['FAVORITES', 'WISHLIST', 'READING', 'COMPLETED'];

export const listTypeParam = [param('listType').isIn(listTypes)];
export const bookIdParam = [param('bookId').isString().notEmpty()];
export const pagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
export const addBody = [body('bookId').isString().notEmpty()];

