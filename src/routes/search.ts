import { Router } from 'express';
import { validateRequest } from '@/middleware/validate';
import { searchBooksRules } from '@/validators/search';
import * as SearchController from '@/controllers/search.controller';

const router: Router = Router();

router.get('/books', searchBooksRules, validateRequest, SearchController.searchBooks);

export default router;

