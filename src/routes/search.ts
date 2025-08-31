import { Router } from 'express';
import { validateRequest } from '@/middleware/validate';
import { searchBooksRules, searchCategoriesRules, searchUsersRules, globalSearchRules } from '@/validators/search';
import { authenticateJWT } from '@/middleware/auth';
import * as SearchController from '@/controllers/search.controller';

const router: Router = Router();

router.get('/books', searchBooksRules, validateRequest, SearchController.searchBooks);
router.get('/categories', searchCategoriesRules, validateRequest, SearchController.searchCategories);
router.get('/users', authenticateJWT, searchUsersRules, validateRequest, SearchController.searchUsers);
router.get('/global', globalSearchRules, validateRequest, SearchController.globalSearch);

export default router;

