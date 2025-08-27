import { body } from 'express-validator';

export const registerRules = [
  body('username').isString().trim().isLength({ min: 3, max: 30 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('firstName').isString().trim().isLength({ min: 1 }),
  body('lastName').isString().trim().isLength({ min: 1 }),
];

export const loginRules = [
  body('identifier').isString().trim().notEmpty(), // email or username
  body('password').isString().notEmpty(),
];

export const refreshRules = [
  body('refreshToken').isString().notEmpty(),
];

export const logoutRules = [
  body('refreshToken').isString().notEmpty(),
];

export const verifyEmailRules = [
  body('tokenId').isString().notEmpty(),
  body('token').isString().notEmpty(),
];

export const requestResetRules = [
  body('email').isEmail().normalizeEmail(),
];

export const resetPasswordRules = [
  body('tokenId').isString().notEmpty(),
  body('token').isString().notEmpty(),
  body('newPassword').isString().isLength({ min: 8 }),
];
