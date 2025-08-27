import { Router } from 'express';
import { authenticateJWT } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validate';
import * as UsersController from '@/controllers/users.controller';
import { listRules, idParam, updateProfileRules, changePasswordRules } from '@/validators/users';
import { uploadAvatar } from '@/utils/storage';

const router: Router = Router();

router.get('/profile', authenticateJWT, UsersController.getProfile);
router.put('/profile', authenticateJWT, updateProfileRules, validateRequest, UsersController.updateProfile);
router.post('/profile/avatar', authenticateJWT, uploadAvatar.single('file'), UsersController.updateAvatar);
router.put('/profile/password', authenticateJWT, changePasswordRules, validateRequest, UsersController.changePassword);

router.get('/', listRules, validateRequest, UsersController.list);
router.get('/:id', idParam, validateRequest, UsersController.getById);

export default router;
