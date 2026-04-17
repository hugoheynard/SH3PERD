import { AuthGuard } from '../auth.guard.js';
import type { TVerifyAuthTokenFn } from '../../types/auth.core.contracts.js';
import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { TAuthTokenPayload } from '../../types/auth.domain.tokens.js';
import type { TUserId } from '@sh3pherd/shared-types';
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
    const payload: TAuthTokenPayload = { user_id: 'user_123' as TUserId };
    mockVerifyAuthTokenFn.mockResolvedValue(payload);

    const req: { headers: { authorization: string }; user_id?: TUserId } = {
      headers: { authorization: 'Bearer validToken' },
    };
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

  /* ── Malformed Authorization header ──
   * The extraction strategy is `header?.split(' ')[1]`. These cases
   * document how each malformed shape is classified — either rejected
   * at extraction time (401 "Missing auth token") or forwarded to the
   * verifier, which will reject on its own (401 "Invalid auth token").
   *
   * The cases below lock in the current behaviour so a refactor of the
   * extraction (e.g. a regex matcher, a stricter `Bearer ` prefix
   * check) makes its intent visible through the test diff. */

  describe('malformed Authorization headers', () => {
    it.each([
      ['empty header', ''],
      ['Bearer with no token', 'Bearer'],
      ['Bearer with trailing space only', 'Bearer '],
      ['Bearer with double space', 'Bearer  token'],
      ['token-only — no prefix', 'jwt_token_here'],
    ])('should 401 with "Missing auth token" for %s', async (_label, header) => {
      await expect(guard.canActivate(mockContext(header))).rejects.toThrow(
        new UnauthorizedException('Missing auth token'),
      );
      // Never reaches the verifier — no leak of the raw value into the
      // verification path.
      expect(mockVerifyAuthTokenFn).not.toHaveBeenCalled();
    });

    it.each([
      ['lowercase bearer prefix', 'bearer tok'],
      ['unknown prefix word', 'Token tok'],
      ['garbage prefix', 'xxx tok'],
    ])(
      'should forward the 2nd split segment to the verifier for %s (currently prefix-agnostic)',
      async (_label, header) => {
        mockVerifyAuthTokenFn.mockResolvedValue(null);

        await expect(guard.canActivate(mockContext(header))).rejects.toThrow(
          new UnauthorizedException('Invalid auth token'),
        );
        // The verifier is the gatekeeper here — any non-JWT string is
        // rejected on signature mismatch. This test guards against a
        // future change that would *skip* verification for unknown
        // prefixes and let the raw value through silently.
        expect(mockVerifyAuthTokenFn).toHaveBeenCalledWith({ authToken: 'tok' });
      },
    );

    it('should only forward the 2nd split segment when extra segments are present', async () => {
      mockVerifyAuthTokenFn.mockResolvedValue(null);

      await expect(guard.canActivate(mockContext('Bearer first second third'))).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockVerifyAuthTokenFn).toHaveBeenCalledWith({ authToken: 'first' });
    });
  });
});
