import { Router } from 'express';
import * as ListsController from '@/controllers/lists.controller';
import { authenticateJWT } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import { listTypeParam, pagination, addBody, bookIdParam } from '@/validators/lists';

const router: Router = Router();

router.use(authenticateJWT);

// Get all lists grouped
router.get('/', ListsController.listAll);

// Get items in a list type
router.get('/:listType', listTypeParam, pagination, validateRequest, ListsController.listByType);

// Add to a list
router.post('/:listType', listTypeParam, addBody, validateRequest, ListsController.add);

// Remove from a list
router.delete('/:listType/:bookId', listTypeParam, bookIdParam, validateRequest, ListsController.remove);

export default router;

