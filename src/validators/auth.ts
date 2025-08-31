import { body } from 'express-validator';

// Helper to support REST Client placeholders when not expanded
// It replaces placeholders with valid values so validation passes
function expandPlaceholders(value: unknown): string {
  const str = String(value ?? '');
  return str
    .replace(/\{\{\s*\$timestamp\s*\}\}/g, () => String(Date.now()))
    .replace(/\{\{\s*\$randomInt\s+\d+\s+\d+\s*\}\}/g, () => String(Math.floor(Math.random() * 90000) + 10000));
}

export const registerRules = [
  body('username')
    .isString()
    .customSanitizer(expandPlaceholders)
    .trim()
    .isLength({ min: 3, max: 30 }),
  body('email')
    .customSanitizer(expandPlaceholders)
    .isEmail()
    .normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('firstName').isString().trim().isLength({ min: 1 }),
  body('lastName').isString().trim().isLength({ min: 1 }),
];

export const loginRules = [
  body('identifier').isString().trim().notEmpty(), // email or username
  body('password').isString().notEmpty(),
];

export const refreshRules = [
  body('refreshToken')
    .optional()
    .isString()
    .withMessage('Refresh token must be a string if provided'),
];

export const logoutRules = [
  body('refreshToken')
    .optional()
    .isString()
    .withMessage('Refresh token must be a string if provided'),
];

export const verifyEmailRules = [
  body('tokenId').isString().notEmpty(),
  body('token').isString().notEmpty(),
];

export const requestResetRules = [
  body('email').customSanitizer(expandPlaceholders).isEmail().normalizeEmail(),
];

export const resetPasswordRules = [
  body('tokenId').isString().notEmpty(),
  body('token').isString().notEmpty(),
  body('newPassword').isString().isLength({ min: 8 }),
];
