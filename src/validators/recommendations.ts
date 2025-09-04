import { query, param } from 'express-validator';

/**
 * Validation rules for personalized recommendations endpoint
 */
export const personalizedRecommendationsRules = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be a number between 1 and 50'),
  
  query('excludeRead')
    .optional()
    .isBoolean()
    .withMessage('excludeRead must be a boolean'),
  
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('minRating must be a number between 0 and 5'),
  
  // Pagination & sorting
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('sortBy')
    .optional()
    .isIn(['score', 'rating', 'title'])
    .withMessage('sortBy must be one of: score, rating, title'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),
];

/**
 * Validation rules for similar books endpoint
 */
export const similarBooksRules = [
  param('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isString()
    .withMessage('Book ID must be a string'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be a number between 1 and 20'),
  // Pagination & sorting
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('sortBy')
    .optional()
    .isIn(['score', 'rating', 'title'])
    .withMessage('sortBy must be one of: score, rating, title'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),
];

/**
 * Validation rules for trending books endpoint
 */
export const trendingBooksRules = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be a number between 1 and 50'),
  // Pagination & sorting
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('sortBy')
    .optional()
    .isIn(['score', 'rating', 'title'])
    .withMessage('sortBy must be one of: score, rating, title'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),
];

/**
 * Validation rules for category recommendations endpoint
 */
export const categoryRecommendationsRules = [
  param('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isString()
    .withMessage('Category ID must be a string'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Limit must be a number between 1 and 30'),
  // Pagination & sorting
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('sortBy')
    .optional()
    .isIn(['score', 'rating', 'title'])
    .withMessage('sortBy must be one of: score, rating, title'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),
];

/**
 * Common validation rules for recommendation queries
 */
export const baseRecommendationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('sortBy')
    .optional()
    .isIn(['score', 'rating', 'title'])
    .withMessage('sortBy must be one of: score, rating, title'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),
];
