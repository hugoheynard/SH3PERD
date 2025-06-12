import { AuthGuard } from './auth.guard';
import type { TVerifyAuthTokenFn } from '../../../auth/types/auth.core.contracts';
import  { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { TAuthTokenPayload } from '../../../auth/types/auth.domain.tokens';
import { jest } from '@jest/globals';


describe('AuthGuard', () => {
  let guard: AuthGuard;
  let verifyAuthTokenFn: jest.MockedFunction<TVerifyAuthTokenFn>;

  const mockContext = (authHeader?: string) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    verifyAuthTokenFn = jest.fn();
    guard = new AuthGuard(verifyAuthTokenFn);
  });

  it('should throw if no auth token is present', async () => {
    await expect(guard.canActivate(mockContext())).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if the token is invalid', async () => {
    verifyAuthTokenFn.mockResolvedValue(null); // simulate invalid token
    const ctx = mockContext('Bearer invalidToken');

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should return true and attach user_id if token is valid', async () => {
    const payload: TAuthTokenPayload = { user_id: 'user123' };
    verifyAuthTokenFn.mockResolvedValue(payload);

    const req = { headers: { authorization: 'Bearer validToken' } };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(req.user_id).toBe(payload.user_id);
  });
});
