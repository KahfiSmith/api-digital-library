import { Router } from 'express';
import * as ReviewsController from '@/controllers/reviews.controller';
import { authenticateJWT } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import { listQuery, idParam, userIdParam, createRules, updateRules } from '@/validators/reviews';

const router: Router = Router();

// Public: list reviews for a book
router.get('/book/:id', listQuery, validateRequest, ReviewsController.listByBook);

// Auth: list reviews for a user (self unless admin/librarian)
router.get('/user/:userId', authenticateJWT, listQuery, validateRequest, ReviewsController.listByUser);

// Auth: create/update/delete own review; admins/librarians can update/delete any
router.post('/', authenticateJWT, createRules, validateRequest, ReviewsController.create);
router.put('/:id', authenticateJWT, updateRules, validateRequest, ReviewsController.update);
router.delete('/:id', authenticateJWT, idParam, validateRequest, ReviewsController.remove);

export default router;

