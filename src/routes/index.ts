import { Router } from 'express';

const router: Router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Digital Library API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      books: '/api/v1/books',
      categories: '/api/v1/categories',
      loans: '/api/v1/loans',
      admin: '/api/v1/admin'
    }
  });
});

export default router;