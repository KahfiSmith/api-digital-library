import { body, param, query } from 'express-validator';
import { ReservationStatus } from '@/types/enums';

export const createReservationValidator = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isString()
    .withMessage('Book ID must be a string'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

export const updateReservationValidator = [
  param('id')
    .notEmpty()
    .withMessage('Reservation ID is required')
    .isString()
    .withMessage('Reservation ID must be a string'),
  body('status')
    .optional()
    .isIn(Object.values(ReservationStatus))
    .withMessage('Invalid reservation status'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

export const reservationIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Reservation ID is required')
    .isString()
    .withMessage('Reservation ID must be a string'),
];

export const bookIdValidator = [
  param('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isString()
    .withMessage('Book ID must be a string'),
];

export const getReservationsValidator = [
  query('status')
    .optional()
    .isIn(Object.values(ReservationStatus))
    .withMessage('Invalid reservation status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const getAllReservationsValidator = [
  query('userId')
    .optional()
    .isString()
    .withMessage('User ID must be a string'),
  query('bookId')
    .optional()
    .isString()
    .withMessage('Book ID must be a string'),
  query('status')
    .optional()
    .isIn(Object.values(ReservationStatus))
    .withMessage('Invalid reservation status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const getBookQueueValidator = [
  param('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isString()
    .withMessage('Book ID must be a string'),
  query('status')
    .optional()
    .isIn(Object.values(ReservationStatus))
    .withMessage('Invalid reservation status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];