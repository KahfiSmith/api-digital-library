import { Router } from 'express';
import type { Request, Response } from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all loans endpoint' });
});

router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Get loan by ID endpoint' });
});

router.post('/', (req: Request, res: Response) => {
  res.json({ message: 'Create loan endpoint' });
});

router.put('/:id/return', (req: Request, res: Response) => {
  res.json({ message: 'Return book endpoint' });
});

router.get('/user/:userId', (req: Request, res: Response) => {
  res.json({ message: 'Get loans by user endpoint' });
});

export default router;