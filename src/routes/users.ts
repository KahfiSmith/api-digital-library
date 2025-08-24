import { Router } from 'express';
import type { Request, Response } from 'express';

const router: Router = Router();

router.get('/profile', (req: Request, res: Response) => {
  res.json({ message: 'Get user profile endpoint' });
});

router.put('/profile', (req: Request, res: Response) => {
  res.json({ message: 'Update user profile endpoint' });
});

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all users endpoint' });
});

router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Get user by ID endpoint' });
});

export default router;