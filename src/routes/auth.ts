import { Router } from 'express';
import { register, login, refresh, logout, me, verifyEmail, verifyEmailLink, requestPasswordReset, resetPassword } from '@/controllers/auth.controller';
import { registerRules, loginRules, refreshRules, logoutRules, verifyEmailRules, requestResetRules, resetPasswordRules } from '@/validators/auth';
import { validateRequest } from '@/middleware/validate';
import { authenticateJWT } from '@/middleware/auth';

const router: Router = Router();

router.post('/register', registerRules, validateRequest, register);
router.post('/login', loginRules, validateRequest, login);
router.post('/refresh', refreshRules, validateRequest, refresh);
router.post('/logout', logoutRules, validateRequest, logout);
router.get('/me', authenticateJWT, me);

// Email verification and password reset
router.post('/verify-email', verifyEmailRules, validateRequest, verifyEmail);
// Optional GET route so emailed verification links work directly
router.get('/verify-email', verifyEmailLink);
router.post('/request-password-reset', requestResetRules, validateRequest, requestPasswordReset);
router.post('/reset-password', resetPasswordRules, validateRequest, resetPassword);

export default router;
