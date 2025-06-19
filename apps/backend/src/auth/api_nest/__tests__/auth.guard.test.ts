import { AuthGuard } from '../auth.guard';
import type { TVerifyAuthTokenFn } from '../../types/auth.core.contracts';
import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { TAuthTokenPayload } from '../../types/auth.domain.tokens';
import { jest } from '@jest/globals';
import { type Reflector } from '@nestjs/core';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockVerifyAuthTokenFn: jest.MockedFunction<TVerifyAuthTokenFn>;

  // 🧪 Faux Reflector qui simule une route non publique
  const mockReflector = {
    getAllAndOverride: jest.fn().mockReturnValue(false),
  } as unknown as Reflector;

  // 🧪 Construit un contexte avec en-tête Authorization
  const mockContext = (authHeader?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
        }),
      }),
      getHandler: () => jest.fn(), // Requis pour Reflector
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    mockVerifyAuthTokenFn = jest.fn();
    guard = new AuthGuard(mockReflector, mockVerifyAuthTokenFn);
  });

  it('should throw if no auth token is present', async () => {
    await expect(guard.canActivate(mockContext())).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if the token is invalid', async () => {
    mockVerifyAuthTokenFn.mockResolvedValue(null);
    const ctx = mockContext('Bearer invalidToken');

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should return true and attach user_id if token is valid', async () => {
    const payload: TAuthTokenPayload = { user_id: 'user123' };
    mockVerifyAuthTokenFn.mockResolvedValue(payload);

    const req = { headers: { authorization: 'Bearer validToken' } };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(req.user_id).toBe(payload.user_id);
  });
});
