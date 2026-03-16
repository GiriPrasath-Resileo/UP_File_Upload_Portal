import type { Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const mockNext = jest.fn();

function mockReq(body: unknown = {}): Partial<Request> {
  return { body, query: {}, params: {} };
}

function mockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('validate middleware', () => {
  const schema = z.object({ name: z.string().min(1), age: z.number().min(0) });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls next() when body is valid', () => {
    const req = mockReq({ name: 'John', age: 25 }) as Request;
    const res = mockRes() as Response;
    const mw = validate(schema, 'body');
    mw(req, res, mockNext as any);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'John', age: 25 });
  });

  it('returns 422 when body is invalid', () => {
    const req = mockReq({ name: '', age: -1 }) as Request;
    const res = mockRes() as Response;
    const mw = validate(schema, 'body');
    mw(req, res, mockNext as any);
    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
        errors: expect.any(Object),
      })
    );
  });

  it('validates query when source is query', () => {
    const querySchema = z.object({ page: z.coerce.number().min(1) });
    const req = mockReq() as Request;
    req.query = { page: '5' };
    const res = mockRes() as Response;
    const mw = validate(querySchema, 'query');
    mw(req, res, mockNext as any);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(req.query).toEqual({ page: 5 });
  });

  it('validates params when source is params', () => {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const req = mockReq() as Request;
    req.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
    const res = mockRes() as Response;
    const mw = validate(paramsSchema, 'params');
    mw(req, res, mockNext as any);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(req.params).toEqual({ id: '550e8400-e29b-41d4-a716-446655440000' });
  });
});
