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
      reviews: '/api/v1/reviews',
      lists: '/api/v1/lists',
      notifications: '/api/v1/notifications',
      search: '/api/v1/search',
      reservations: '/api/v1/reservations',
      upload: '/api/v1/upload',
      email: '/api/v1/email',
      recommendations: '/api/v1/recommendations',
      admin: '/api/v1/admin'
    }
  });
});

export default router;