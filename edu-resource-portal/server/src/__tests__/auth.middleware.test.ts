import type { Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import * as authService from '../services/auth.service';

jest.mock('../services/auth.service');

const mockNext = jest.fn();

function mockReq(overrides: Partial<Request> = {}): Partial<Request> {
  return { cookies: {}, ...overrides };
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authenticate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when no token', () => {
    const req = mockReq({ cookies: {} }) as Request;
    const res = mockRes() as Response;
    authenticate(req, res, mockNext as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('calls next when token is valid', () => {
    const user = { id: '1', userId: 'admin', role: 'ADMIN', districtScope: null };
    (authService.verifyAccessToken as jest.Mock).mockReturnValue(user);
    const req = mockReq({ cookies: { accessToken: 'valid-token' } }) as Request;
    const res = mockRes() as Response;
    authenticate(req, res, mockNext as any);
    expect(mockNext).toHaveBeenCalled();
    expect((req as any).user).toEqual(user);
  });

  it('returns 401 when token is invalid', () => {
    (authService.verifyAccessToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid');
    });
    const req = mockReq({ cookies: { accessToken: 'bad' } }) as Request;
    const res = mockRes() as Response;
    authenticate(req, res, mockNext as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
  });
});

describe('requireRole', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when no user', () => {
    const mw = requireRole('ADMIN');
    const req = mockReq() as Request;
    const res = mockRes() as Response;
    mw(req, res, mockNext as any);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('calls next when user has role', () => {
    const mw = requireRole('ADMIN');
    const req = mockReq() as Request;
    (req as any).user = { id: '1', userId: 'a', role: 'ADMIN', districtScope: null };
    const res = mockRes() as Response;
    mw(req, res, mockNext as any);
    expect(mockNext).toHaveBeenCalled();
  });

  it('returns 403 when user lacks role', () => {
    const mw = requireRole('ADMIN');
    const req = mockReq() as Request;
    (req as any).user = { id: '1', userId: 'u', role: 'UPLOADER', districtScope: null };
    const res = mockRes() as Response;
    mw(req, res, mockNext as any);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
  });
});
