import { Router } from 'express';
import * as CronController from '@/controllers/cron.controller';
import { requireRoles } from '@/middleware/auth';

const router: Router = Router();

// Cron job endpoints (admin only for security)
router.post('/check-due-loans', requireRoles('ADMIN'), CronController.checkDueLoans);
router.post('/check-overdue-loans', requireRoles('ADMIN'), CronController.checkOverdueLoans);
router.post('/daily-tasks', requireRoles('ADMIN'), CronController.runDailyTasks);

export default router;