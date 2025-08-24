import { Router } from 'express';
import type { Request, Response } from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Get all categories endpoint' });
});

router.get('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Get category by ID endpoint' });
});

router.post('/', (req: Request, res: Response) => {
  res.json({ message: 'Create category endpoint' });
});

router.put('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Update category endpoint' });
});

router.delete('/:id', (req: Request, res: Response) => {
  res.json({ message: 'Delete category endpoint' });
});

export default router;