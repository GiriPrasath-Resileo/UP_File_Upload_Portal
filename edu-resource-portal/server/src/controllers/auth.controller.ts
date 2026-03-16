import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { env } from '../config/env';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { tokens, user } = await authService.login(req.body);
    res
      .cookie('accessToken',  tokens.accessToken,  { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', tokens.refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ user });
  } catch (err) {
    next(Object.assign(err as Error, { statusCode: 401 }));
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken as string;
    if (!token) { res.status(401).json({ message: 'No refresh token' }); return; }
    const tokens = await authService.refresh(token);
    res
      .cookie('accessToken',  tokens.accessToken,  { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', tokens.refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ message: 'Refreshed' });
  } catch (err) {
    next(Object.assign(err as Error, { statusCode: 401 }));
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken as string;
    if (token) await authService.logout(token);
    res
      .clearCookie('accessToken',  COOKIE_OPTS)
      .clearCookie('refreshToken', COOKIE_OPTS)
      .json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function meHandler(req: Request, res: Response) {
  res.json({ user: req.user });
}
