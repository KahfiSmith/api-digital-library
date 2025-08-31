import { Router } from 'express';
import { authenticateJWT, requireRoles } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import * as AdminController from '@/controllers/admin.controller';
import { listUsersRules, updateStatusRules, recentRules, setPasswordRules, exportRules, updateRoleRules, analyticsTimeseriesRules, topLimitRules } from '@/validators/admin';

const router: Router = Router();

router.use(authenticateJWT, requireRoles('ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/users', listUsersRules, validateRequest, AdminController.listUsers);
router.put('/users/:id/status', updateStatusRules, validateRequest, AdminController.updateUserStatus);
router.get('/recent', recentRules, validateRequest, AdminController.recent);
router.put('/users/:id/password', setPasswordRules, validateRequest, AdminController.setUserPassword);
router.put('/users/:id/role', updateRoleRules, validateRequest, AdminController.updateUserRole);
router.get('/export/users.csv', exportRules, validateRequest, AdminController.exportUsersCsv);
router.get('/export/books.csv', exportRules, validateRequest, AdminController.exportBooksCsv);
router.get('/export/loans.csv', exportRules, validateRequest, AdminController.exportLoansCsv);
router.get('/analytics/overview', AdminController.analyticsOverview);

// New analytics routes
router.get('/analytics/loans', analyticsTimeseriesRules, validateRequest, AdminController.getLoanStatistics);
router.get('/analytics/users/engagement', analyticsTimeseriesRules, validateRequest, AdminController.getUserEngagement);
router.get('/analytics/books/popularity', topLimitRules, validateRequest, AdminController.getBookPopularityMetrics);
router.get('/analytics/dashboard', AdminController.getDashboardData);

// Simple health for admin scope
router.get('/health', (_req, res) => res.json({ status: 'OK', scope: 'admin' }));

export default router;
