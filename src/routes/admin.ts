import { Router } from 'express';
import { authenticateJWT, requireRoles } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import * as AdminController from '@/controllers/admin.controller';
import { listUsersRules, updateStatusRules, recentRules, setPasswordRules, exportRules, updateRoleRules, analyticsTimeseriesRules, topLimitRules } from '@/validators/admin';

const router: Router = Router();

router.use(authenticateJWT, requireRoles('ADMIN'));

router.get('/stats', AdminController.stats);
router.get('/users', listUsersRules, validateRequest, AdminController.listUsers);
router.put('/users/:id/status', updateStatusRules, validateRequest, AdminController.updateUserStatus);
router.get('/recent', recentRules, validateRequest, AdminController.recent);
router.put('/users/:id/password', setPasswordRules, validateRequest, AdminController.setUserPassword);
router.put('/users/:id/role', updateRoleRules, validateRequest, AdminController.updateUserRole);
router.get('/export/users.csv', exportRules, validateRequest, AdminController.exportUsersCsv);
router.get('/export/books.csv', exportRules, validateRequest, AdminController.exportBooksCsv);
router.get('/export/loans.csv', exportRules, validateRequest, AdminController.exportLoansCsv);
router.get('/analytics/overview', AdminController.analyticsOverview);
router.get('/analytics/timeseries', analyticsTimeseriesRules, validateRequest, AdminController.analyticsTimeseries);
router.get('/analytics/top-books', topLimitRules, validateRequest, AdminController.analyticsTopBooks);
router.get('/analytics/top-categories', topLimitRules, validateRequest, AdminController.analyticsTopCategories);

// Simple health for admin scope
router.get('/health', (req, res) => res.json({ status: 'OK', scope: 'admin' }));

export default router;
