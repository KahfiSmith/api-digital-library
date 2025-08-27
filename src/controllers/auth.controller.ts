import { Request, Response } from 'express';
import * as AuthService from '@/services/auth.service';
import { ResponseUtil } from '@/utils/response';
import { setAuthCookies, clearAuthCookies, getCookie, COOKIE_NAMES } from '@/utils/cookies';

export async function register(req: Request, res: Response) {
  const { username, email, password, firstName, lastName } = req.body;
  const result = await AuthService.register({ username, email, password, firstName, lastName });
  setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
  return ResponseUtil.success(res, 'User registered', result, 201);
}

export async function login(req: Request, res: Response) {
  const { identifier, password } = req.body;
  const result = await AuthService.login({ identifier, password });
  setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
  return ResponseUtil.success(res, 'Login successful', result);
}

export async function refresh(req: Request, res: Response) {
  const bodyToken = req.body?.refreshToken as string | undefined;
  const cookieToken = getCookie(req, COOKIE_NAMES.refresh);
  const token = bodyToken || cookieToken || '';
  const result = await AuthService.refresh({ refreshToken: token });
  setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
  return ResponseUtil.success(res, 'Token refreshed', result);
}

export async function logout(req: Request, res: Response) {
  const bodyToken = req.body?.refreshToken as string | undefined;
  const cookieToken = getCookie(req, COOKIE_NAMES.refresh);
  const token = bodyToken || cookieToken || '';
  await AuthService.logout({ refreshToken: token });
  clearAuthCookies(res);
  return ResponseUtil.success(res, 'Logged out');
}

export async function me(req: Request, res: Response) {
  return ResponseUtil.success(res, 'Current user', { user: req.user });
}

export async function verifyEmail(req: Request, res: Response) {
  const { tokenId, token } = req.body as { tokenId: string; token: string };
  await AuthService.verifyEmail({ tokenId, token });
  return ResponseUtil.success(res, 'Email verified');
}

export async function requestPasswordReset(req: Request, res: Response) {
  const { email } = req.body as { email: string };
  const result = await AuthService.requestPasswordReset({ email });
  return ResponseUtil.success(res, 'If that email exists, a reset link has been sent', result);
}

export async function resetPassword(req: Request, res: Response) {
  const { tokenId, token, newPassword } = req.body as { tokenId: string; token: string; newPassword: string };
  await AuthService.resetPassword({ tokenId, token, newPassword });
  return ResponseUtil.success(res, 'Password has been reset');
}
