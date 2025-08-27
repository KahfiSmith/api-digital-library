import { Router } from 'express';
import * as CategoriesController from '@/controllers/categories.controller';
import { authenticateJWT, requireRoles } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import { listRules, idParam, createRules, updateRules } from '@/validators/categories';

const router: Router = Router();

router.get('/', listRules, validateRequest, CategoriesController.list);
router.get('/:id', idParam, validateRequest, CategoriesController.getById);

// Protected
router.post('/', authenticateJWT, requireRoles('ADMIN', 'LIBRARIAN'), createRules, validateRequest, CategoriesController.create);
router.put('/:id', authenticateJWT, requireRoles('ADMIN', 'LIBRARIAN'), updateRules, validateRequest, CategoriesController.update);
router.delete('/:id', authenticateJWT, requireRoles('ADMIN', 'LIBRARIAN'), idParam, validateRequest, CategoriesController.remove);

export default router;
