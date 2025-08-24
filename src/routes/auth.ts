import { Router } from 'express';
import type { Request, Response } from 'express';

const router: Router = Router();

router.post('/register', (req: Request, res: Response) => {
  res.json({ message: 'Register endpoint' });
});

router.post('/login', (req: Request, res: Response) => {
  res.json({ message: 'Login endpoint' });
});

router.post('/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logout endpoint' });
});

router.post('/refresh', (req: Request, res: Response) => {
  res.json({ message: 'Refresh token endpoint' });
});

export default router;