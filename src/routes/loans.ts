import { Router } from 'express';
import * as LoansController from '@/controllers/loans.controller';
import { authenticateJWT, requireRoles } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import { listRules, idParam, createRules } from '@/validators/loans';

const router: Router = Router();

// Admin/Librarian can view all loans; regular users should use /user/:userId
router.get('/', authenticateJWT, requireRoles('ADMIN', 'LIBRARIAN'), listRules, validateRequest, LoansController.list);
router.get('/:id', authenticateJWT, idParam, validateRequest, LoansController.getById);

// Create a loan: users can only create for themselves
router.post('/', authenticateJWT, createRules, validateRequest, LoansController.create);

// Return loan
router.put('/:id/return', authenticateJWT, idParam, validateRequest, LoansController.returnLoan);

// Loans for a user
router.get('/user/:userId', authenticateJWT, listRules, validateRequest, LoansController.listByUser);

export default router;
