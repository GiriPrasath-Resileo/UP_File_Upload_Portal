import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { env } from '../config/env';
import type { CreateUserData, LoginData, UpdateUserData } from '@edu-portal/shared';
import { logger } from '../utils/logger';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  userId: string;
  role: string;
  districtScope: string | null;
}

function signAccess(payload: AuthUser): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as string,
  } as jwt.SignOptions);
}

function signRefresh(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
  } as jwt.SignOptions);
}

export async function login(data: LoginData): Promise<{ tokens: TokenPair; user: AuthUser }> {
  const user = await prisma.user.findUnique({ where: { userId: data.userId } });
  if (!user || !user.isActive) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(data.password, user.passwordHash);
  if (!match) throw new Error('Invalid credentials');

  const authUser: AuthUser = {
    id: user.id,
    userId: user.userId,
    role: user.role,
    districtScope: user.districtScope,
  };

  const accessToken  = signAccess(authUser);
  const refreshToken = signRefresh(user.id);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  logger.info(`User ${user.userId} logged in`);
  return { tokens: { accessToken, refreshToken }, user: authUser };
}

export async function refresh(token: string): Promise<TokenPair> {
  let payload: { sub: string };
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    throw new Error('Invalid refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new Error('Refresh token expired or not found');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw new Error('User not found or inactive');

  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { token } });

  const authUser: AuthUser = {
    id: user.id,
    userId: user.userId,
    role: user.role,
    districtScope: user.districtScope,
  };

  const accessToken   = signAccess(authUser);
  const newRefresh    = signRefresh(user.id);
  const expiresAt     = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: newRefresh, userId: user.id, expiresAt } });

  return { accessToken, refreshToken: newRefresh };
}

export async function logout(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function createUser(data: CreateUserData): Promise<AuthUser> {
  const exists = await prisma.user.findUnique({ where: { userId: data.userId } });
  if (exists) throw new Error(`User '${data.userId}' already exists`);

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      userId: data.userId,
      passwordHash,
      role: data.role,
      districtScope: data.districtScope ?? null,
    },
  });

  return { id: user.id, userId: user.userId, role: user.role, districtScope: user.districtScope };
}

export async function updateUser(id: string, data: UpdateUserData): Promise<AuthUser> {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(data.role          !== undefined && { role: data.role }),
      ...(data.districtScope !== undefined && { districtScope: data.districtScope }),
      ...(data.isActive      !== undefined && { isActive: data.isActive }),
    },
  });
  return { id: user.id, userId: user.userId, role: user.role, districtScope: user.districtScope };
}

export async function changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new Error('Current password is incorrect');
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
}

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, userId: true, role: true, districtScope: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
}

export function verifyAccessToken(token: string): AuthUser {
  return jwt.verify(token, env.JWT_SECRET) as AuthUser;
}
