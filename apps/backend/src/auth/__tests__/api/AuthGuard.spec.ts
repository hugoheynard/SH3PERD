import { AuthGuard } from '../../api/auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { userId } from '../test-helpers';
import type { TVerifyAuthTokenFn } from '../../types/auth.core.contracts';

describe('AuthGuard', () => {
  function createGuard(verifyFn?: jest.Mock) {
    const reflector = new Reflector();
    const verifyAuthTokenFn: jest.MockedFunction<TVerifyAuthTokenFn> =
      verifyFn ?? jest.fn().mockResolvedValue({ user_id: userId() });

    const guard = new AuthGuard(reflector, verifyAuthTokenFn);
    return { guard, reflector, verifyAuthTokenFn };
  }

  function mockContext(
    options: {
      authHeader?: string;
      isPublic?: boolean;
    } = {},
  ) {
    const request: any = {
      headers: {},
    };
    if (options.authHeader) {
      request.headers['authorization'] = options.authHeader;
    }

    const handler = { name: 'testHandler' };
    const classRef = { name: 'TestController' };

    const context: any = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => handler,
      getClass: () => classRef,
    };

    return { context, request };
  }

  describe('public routes', () => {
    it('should allow access to @Public() routes without a token', async () => {
      const { guard, reflector } = createGuard();
      const { context } = mockContext();

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('protected routes', () => {
    it('should throw UnauthorizedException when no Authorization header', async () => {
      const { guard, reflector } = createGuard();
      const { context } = mockContext();

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const verifyFn = jest.fn().mockResolvedValue(null);
      const { guard, reflector } = createGuard(verifyFn);
      const { context } = mockContext({ authHeader: 'Bearer invalid-token' });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should attach user_id to request and return true for a valid token', async () => {
      const uid = userId(5);
      const verifyFn = jest.fn().mockResolvedValue({ user_id: uid });
      const { guard, reflector } = createGuard(verifyFn);
      const { context, request } = mockContext({ authHeader: 'Bearer valid-token' });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user_id).toBe(uid);
      expect(verifyFn).toHaveBeenCalledWith({ authToken: 'valid-token' });
    });

    it('should extract token from Bearer scheme', async () => {
      const { guard, reflector, verifyAuthTokenFn } = createGuard();
      const { context } = mockContext({ authHeader: 'Bearer my-jwt-here' });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      await guard.canActivate(context);

      expect(verifyAuthTokenFn).toHaveBeenCalledWith({ authToken: 'my-jwt-here' });
    });
  });
});
