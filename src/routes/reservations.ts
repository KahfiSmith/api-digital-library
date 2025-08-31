import { Router } from 'express';
import * as reservationsController from '@/controllers/reservations.controller';
import { authenticateJWT, requireRoles } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import {
  createReservationValidator,
  updateReservationValidator,
  reservationIdValidator,
  bookIdValidator,
  getReservationsValidator,
  getAllReservationsValidator,
  getBookQueueValidator,
} from '@/validators/reservations';

const router: Router = Router();

// User routes - require authentication
router.post(
  '/',
  authenticateJWT,
  createReservationValidator,
  validateRequest,
  reservationsController.createReservation
);

router.get(
  '/my',
  authenticateJWT,
  getReservationsValidator,
  validateRequest,
  reservationsController.getMyReservations
);

router.get(
  '/queue/:bookId/position',
  authenticateJWT,
  bookIdValidator,
  validateRequest,
  reservationsController.getQueuePosition
);

router.get(
  '/:id',
  authenticateJWT,
  reservationIdValidator,
  validateRequest,
  reservationsController.getReservation
);

router.patch(
  '/:id',
  authenticateJWT,
  updateReservationValidator,
  validateRequest,
  reservationsController.updateReservation
);

router.delete(
  '/:id/cancel',
  authenticateJWT,
  reservationIdValidator,
  validateRequest,
  reservationsController.cancelReservation
);

// Admin/Librarian routes
router.get(
  '/',
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  getAllReservationsValidator,
  validateRequest,
  reservationsController.getAllReservations
);

router.get(
  '/book/:bookId/queue',
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  getBookQueueValidator,
  validateRequest,
  reservationsController.getBookQueue
);

router.post(
  '/book/:bookId/process-queue',
  authenticateJWT,
  requireRoles('ADMIN', 'LIBRARIAN'),
  bookIdValidator,
  validateRequest,
  reservationsController.processBookQueue
);

export default router;