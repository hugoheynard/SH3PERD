import { jest } from '@jest/globals';
import { AuthService } from '../auth.service.js';
import type { IAbstractRefreshTokenService } from '../token-manager/RefreshTokenService.js';
import type { IAbstractJWTService } from '../token-manager/JwtService.js';
import type { IRefreshTokenRepository } from '../../repositories/RefreshTokenMongoRepository.js';
import type { TUserId, TRefreshToken } from '@sh3pherd/shared-types';

describe('AuthService', () => {
  let service: AuthService;
  let refreshTokenService: jest.Mocked<IAbstractRefreshTokenService>;
  let jwtService: jest.Mocked<IAbstractJWTService>;
  let refreshRepo: jest.Mocked<Pick<IRefreshTokenRepository, 'deleteMany'>>;

  beforeEach(() => {
    refreshTokenService = {
      generateRefreshToken: jest.fn<IAbstractRefreshTokenService['generateRefreshToken']>(),
      verifyRefreshToken: jest.fn<IAbstractRefreshTokenService['verifyRefreshToken']>(),
      revokeRefreshToken: jest.fn<IAbstractRefreshTokenService['revokeRefreshToken']>(),
      generateRefreshTokenCookie:
        jest.fn<IAbstractRefreshTokenService['generateRefreshTokenCookie']>(),
    };

    jwtService = {
      generateAuthToken: jest.fn<IAbstractJWTService['generateAuthToken']>(),
      verifyAuthToken: jest.fn<IAbstractJWTService['verifyAuthToken']>(),
    };

    refreshRepo = {
      deleteMany: jest.fn().mockResolvedValue(true),
    };

    service = new (AuthService as any)(refreshTokenService, jwtService, refreshRepo) as AuthService;
  });

  it('should create a full auth session', async () => {
    const user_id = 'user_123' as TUserId;
    jwtService.generateAuthToken.mockResolvedValue('access-token');
    refreshTokenService.generateRefreshToken.mockResolvedValue(
      'refreshToken_refresh-token' as TRefreshToken,
    );
    refreshTokenService.generateRefreshTokenCookie.mockReturnValue({
      name: 'sh3pherd_refreshToken',
      value: 'refreshToken_refresh-token' as TRefreshToken,
      options: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: 3600,
      },
    });

    const result = await service.createAuthSession({ user_id });

    expect(refreshRepo.deleteMany).toHaveBeenCalledWith({ user_id });
    expect(jwtService.generateAuthToken).toHaveBeenCalledWith({ payload: { user_id } });
    expect(refreshTokenService.generateRefreshToken).toHaveBeenCalledWith({ user_id });

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
          path: '/api/auth',
          maxAge: 3600,
        },
      },
    });
  });

  it('should rotate session within an existing family', async () => {
    const user_id = 'user_123' as TUserId;
    const family_id = 'family-abc';
    jwtService.generateAuthToken.mockResolvedValue('new-access-token');
    refreshTokenService.generateRefreshToken.mockResolvedValue(
      'refreshToken_new-token' as TRefreshToken,
    );
    refreshTokenService.generateRefreshTokenCookie.mockReturnValue({
      name: 'sh3pherd_refreshToken',
      value: 'refreshToken_new-token' as TRefreshToken,
      options: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: 3600,
      },
    });

    const result = await service.rotateSession({ user_id, family_id });

    expect(jwtService.generateAuthToken).toHaveBeenCalledWith({ payload: { user_id } });
    expect(refreshTokenService.generateRefreshToken).toHaveBeenCalledWith({
      user_id,
      family_id,
    });

    expect(result.authToken).toBe('new-access-token');
    expect(result.refreshTokenSecureCookie).toBeDefined();
  });

  it('should verify auth token', async () => {
    const payload = { user_id: 'user_123' as TUserId };
    jwtService.verifyAuthToken.mockResolvedValue(payload);

    const result = await service.verifyAuthToken({ authToken: 'valid-token' });

    expect(jwtService.verifyAuthToken).toHaveBeenCalledWith({ authToken: 'valid-token' });
    expect(result).toBe(payload);
  });

  it('should revoke refresh token', async () => {
    const refreshToken = 'refreshToken_refresh-token' as TRefreshToken;
    const revoked = { revokedToken: refreshToken };
    refreshTokenService.revokeRefreshToken.mockResolvedValue(revoked);

    const result = await service.revokeRefreshToken({ refreshToken });

    expect(refreshTokenService.revokeRefreshToken).toHaveBeenCalledWith({ refreshToken });
    expect(result).toBe(revoked);
  });
});
