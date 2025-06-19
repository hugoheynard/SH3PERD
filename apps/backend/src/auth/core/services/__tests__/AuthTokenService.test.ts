import type {
  TAuthTokenPayload,
  TAuthTokenServiceDeps,
  TDeleteAllRefreshTokensForUserFn,
  TFindRefreshTokenFn,
  TGenerateAuthTokenFn,
  TGenerateRefreshTokenFn,
  TRefreshToken,
  TRevokeRefreshTokenFn,
  TVerifyAuthTokenFn,
} from '@sh3pherd/shared-types';
import { jest } from '@jest/globals';
import { AuthTokenService } from '../AuthTokenService';

describe('AuthTokenService', () => {
  let service: AuthTokenService;
  let deps: jest.Mocked<TAuthTokenServiceDeps>;

  beforeEach(() => {
    deps = {
      findRefreshTokenFn: jest.fn<TFindRefreshTokenFn>(),
      verifyRefreshTokenFn: jest.fn<TVerifyAuthTokenFn>(),
      deleteAllRefreshTokensForUserFn: jest.fn<TDeleteAllRefreshTokensForUserFn>(),
      generateAuthTokenFn: jest.fn<TGenerateAuthTokenFn>(),
      generateRefreshTokenFn: jest.fn<TGenerateRefreshTokenFn>(),
      verifyAuthTokenFn: jest.fn<TVerifyAuthTokenFn>(),
      revokeRefreshTokenFn: jest.fn<TRevokeRefreshTokenFn>(),
      secureCookieConfig: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 3600,
      },
    };

    service = new AuthTokenService(deps);
  });

  it('should create a full auth session', async () => {
    // 🧪 Données de test
    const user_id = 'user_123';
    deps.generateAuthTokenFn.mockResolvedValue('access-token');
    deps.generateRefreshTokenFn.mockResolvedValue('refreshToken_refresh-token');

    // ⚙️ Appel de la méthode à tester
    const result = await service.createAuthSession({ user_id });

    // ✅ Vérifications
    expect(deps.deleteAllRefreshTokensForUserFn).toHaveBeenCalledWith({ user_id });
    expect(deps.generateAuthTokenFn).toHaveBeenCalledWith({ payload: { user_id } });
    expect(deps.generateRefreshTokenFn).toHaveBeenCalledWith({ user_id });

    expect(result).toEqual({
      authToken: 'access-token',
      refreshToken: 'refreshToken_refresh-token',
      refreshTokenSecureCookie: {
        name: 'sh3pherd_refreshToken',
        value: 'refreshToken_refresh-token',
        options: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 3600,
        },
      },
    });
  });

  it('should verify auth token', async () => {
    const authToken = 'valid-token';
    const payload: TAuthTokenPayload = { user_id: 'user_123' };

    deps.verifyAuthTokenFn.mockResolvedValue(payload);

    const result = await service.verifyAuthToken({ authToken });

    expect(deps.verifyAuthTokenFn).toHaveBeenCalledWith({ authToken });
    expect(result).toBe(payload);
  });

  it('should revoke refresh token', async () => {
    const refreshToken = 'refreshToken_refresh-token';
    const revoked = { revokedToken: refreshToken };

    deps.revokeRefreshTokenFn.mockResolvedValue(revoked);

    const result = await service.revokeRefreshToken({ refreshToken });

    expect(deps.revokeRefreshTokenFn).toHaveBeenCalledWith({ refreshToken });
    expect(result).toBe(revoked);
  });

  it('should generate a secure cookie for the refresh token', () => {
    const input: { refreshToken: TRefreshToken } = { refreshToken: 'refreshToken_refresh-token' };

    const result = service.generateRefreshTokenCookie(input);

    expect(result).toEqual({
      name: 'sh3pherd_refreshToken',
      value: 'refreshToken_refresh-token',
      options: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 3600,
      },
    });
  });

  it('should support custom path for cookie', () => {
    const input: { refreshToken: TRefreshToken } = {
      refreshToken: 'refreshToken_refresh-token',
      customPath: '/auth',
    };

    const result = service.generateRefreshTokenCookie(input);

    expect(result.options.path).toBe('/auth');
  });
});
