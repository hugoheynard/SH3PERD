import type {
  TUserId,
  TRefreshToken,
  TRefreshTokenDomainModel,
  TRefreshTokenRecord,
} from '@sh3pherd/shared-types';
import type { IRefreshTokenRepository } from '../repositories/RefreshTokenMongoRepository';
import type { IPasswordService } from '../core/password-manager/types/Interfaces';
import type { IAbstractJWTService } from '../core/token-manager/JwtService';
import type { IAbstractRefreshTokenService } from '../core/token-manager/RefreshTokenService';
import type { IAuthTokenService } from '../services/auth.service';
import type {
  TCreateAuthSessionResult,
  TRefreshTokenSecureCookie,
} from '../types/auth.domain.tokens';
import type { IUserCredentialsRepository } from '../../user/infra/UserCredentialsMongoRepo.repository';
import type { IUserProfileRepository } from '../../user/infra/UserProfileMongoRepo.repository';
import type { IPlatformContractRepository } from '../../platform-contract/infra/PlatformContractMongoRepo';

// ─── ID Helpers ───────────────────────────────────────────────
export const userId = (n = 1) => `user_test-${n}` as TUserId;
export const refreshTokenId = (n = 1) => `refreshToken_test-${n}` as TRefreshToken;

// ─── Domain Model Factories ──────────────────────────────────
export function makeRefreshTokenRecord(
  overrides: Partial<TRefreshTokenDomainModel> = {},
): TRefreshTokenRecord {
  const token = refreshTokenId();
  return {
    id: token,
    refreshToken: token,
    user_id: userId(),
    family_id: 'family-uuid-1',
    isRevoked: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdAt: new Date(),
    ...overrides,
  };
}

export function makeExpiredRefreshToken(
  overrides: Partial<TRefreshTokenDomainModel> = {},
): TRefreshTokenRecord {
  return makeRefreshTokenRecord({
    expiresAt: new Date(Date.now() - 1000), // expired 1s ago
    ...overrides,
  });
}

export function makeRevokedRefreshToken(
  overrides: Partial<TRefreshTokenDomainModel> = {},
): TRefreshTokenRecord {
  return makeRefreshTokenRecord({
    isRevoked: true,
    ...overrides,
  });
}

export function makeSecureCookie(
  token: TRefreshToken = refreshTokenId(),
): TRefreshTokenSecureCookie {
  return {
    name: 'sh3pherd_refreshToken',
    value: token,
    options: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 604800000,
      path: '/api/auth',
    },
  };
}

export function makeSessionResult(
  overrides: Partial<TCreateAuthSessionResult> = {},
): TCreateAuthSessionResult {
  return {
    authToken: 'jwt-test-token',
    refreshToken: refreshTokenId(),
    refreshTokenSecureCookie: makeSecureCookie(),
    ...overrides,
  };
}

// ─── Mock Repositories ───────────────────────────────────────
export function mockRefreshTokenRepo(): jest.Mocked<IRefreshTokenRepository> {
  return {
    save: jest.fn().mockResolvedValue(true),
    findOne: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    updateOne: jest.fn().mockResolvedValue(null),
    deleteOne: jest.fn().mockResolvedValue(true),
    deleteMany: jest.fn().mockResolvedValue(true),
    startSession: jest.fn(),
  } as any;
}

export function mockUserCredentialsRepo(): jest.Mocked<
  Pick<IUserCredentialsRepository, 'findOne' | 'save' | 'updateOne' | 'startSession'>
> {
  return {
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue(true),
    updateOne: jest.fn().mockResolvedValue(null),
    startSession: jest.fn(),
  } as any;
}

export function mockUserProfileRepo(): jest.Mocked<Pick<IUserProfileRepository, 'save'>> {
  return {
    save: jest.fn().mockResolvedValue(true),
  } as any;
}

export function mockPlatformContractRepo(): jest.Mocked<Pick<IPlatformContractRepository, 'save'>> {
  return {
    save: jest.fn().mockResolvedValue(true),
  } as any;
}

// ─── Mock Services ───────────────────────────────────────────
export function mockPasswordService(): jest.Mocked<IPasswordService> {
  return {
    hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    comparePassword: jest.fn().mockResolvedValue({ isValid: true, wasRehashed: false }),
  };
}

export function mockJwtService(): jest.Mocked<IAbstractJWTService> {
  return {
    generateAuthToken: jest.fn().mockResolvedValue('jwt-test-token'),
    verifyAuthToken: jest.fn().mockResolvedValue({ user_id: userId() }),
  };
}

export function mockRefreshTokenService(): jest.Mocked<IAbstractRefreshTokenService> {
  return {
    generateRefreshToken: jest.fn().mockResolvedValue(refreshTokenId()),
    verifyRefreshToken: jest.fn().mockReturnValue(true),
    revokeRefreshToken: jest.fn().mockResolvedValue({ revokedToken: refreshTokenId() }),
    generateRefreshTokenCookie: jest.fn().mockReturnValue(makeSecureCookie()),
  };
}

export function mockAuthService(): jest.Mocked<IAuthTokenService> {
  return {
    createAuthSession: jest.fn().mockResolvedValue(makeSessionResult()),
    rotateSession: jest.fn().mockResolvedValue(makeSessionResult()),
    verifyAuthToken: jest.fn().mockResolvedValue({ user_id: userId() }),
    verifyRefreshToken: jest.fn().mockReturnValue(true),
    revokeRefreshToken: jest.fn().mockResolvedValue({ revokedToken: refreshTokenId() }),
  };
}
