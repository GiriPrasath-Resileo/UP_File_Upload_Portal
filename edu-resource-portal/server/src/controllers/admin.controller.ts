import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try { res.json(await authService.listUsers()); } catch (err) { next(err); }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) { next(Object.assign(err as Error, { statusCode: 409 })); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) { next(err); }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user!.id === req.params.id) {
      res.status(400).json({ message: 'Cannot delete your own account' }); return;
    }
    await authService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.id, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (err) { next(Object.assign(err as Error, { statusCode: 400 })); }
}
