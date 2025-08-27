import { Router } from 'express';
import * as BooksController from '@/controllers/books.controller';
import * as ReviewsController from '@/controllers/reviews.controller';
import { authenticateJWT, requireRoles } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import { listRules, idParam, createRules, updateRules } from '@/validators/books';
import { uploadCover, uploadPdf } from '@/utils/storage';

const router: Router = Router();

router.get('/', listRules, validateRequest, BooksController.list);
router.get('/:id', idParam, validateRequest, BooksController.getById);
router.get('/:id/reviews', listRules, validateRequest, ReviewsController.listByBook);

// Protected routes for create/update/delete
router.post('/', authenticateJWT, requireRoles('ADMIN', 'LIBRARIAN'), createRules, validateRequest, BooksController.create);
router.put('/:id', authenticateJWT, requireRoles('ADMIN', 'LIBRARIAN'), updateRules, validateRequest, BooksController.update);
router.delete('/:id', authenticateJWT, requireRoles('ADMIN', 'LIBRARIAN'), idParam, validateRequest, BooksController.remove);

// Uploads
router.post('/:id/cover', authenticateJWT, requireRoles('ADMIN', 'LIBRARIAN'), idParam, validateRequest, uploadCover.single('file'), BooksController.updateCover);
router.post('/:id/pdf', authenticateJWT, requireRoles('ADMIN', 'LIBRARIAN'), idParam, validateRequest, uploadPdf.single('file'), BooksController.updatePdf);

export default router;
