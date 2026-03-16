import type { Request, Response } from 'express';
import { errorHandler, notFound } from '../middleware/error.middleware';

jest.mock('../utils/logger', () => ({
  logger: { error: jest.fn() },
}));

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  it('sends 500 for generic errors', () => {
    const res = mockRes() as Response;
    const err = new Error('Something broke');
    errorHandler(err, {} as any, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  it('sends custom status for errors with statusCode', () => {
    const res = mockRes() as Response;
    const err = new Error('Bad request') as Error & { statusCode?: number };
    err.statusCode = 400;
    errorHandler(err, {} as any, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Bad request' });
  });

  it('masks message for 5xx errors', () => {
    const res = mockRes() as Response;
    const err = new Error('DB connection failed') as Error & { statusCode?: number };
    err.statusCode = 503;
    errorHandler(err, {} as any, res, () => {});
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});

describe('notFound', () => {
  it('sends 404', () => {
    const res = mockRes() as Response;
    notFound({} as any, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Route not found' });
  });
});
