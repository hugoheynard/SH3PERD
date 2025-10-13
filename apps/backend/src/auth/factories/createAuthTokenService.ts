
import { generateTypedId } from '../../utils/ids/generateTypedId.js';
import { dateIsNotPassed } from '../../utils/date/dateIsNotPassed.js';
import { AuthTokenService, type TAuthTokenServiceFactory } from '../core/services/AuthTokenService.js';
import { JwtAuthTokenManager } from '../core/token-manager/JwtAuthTokenManager.js';
import { RefreshTokenManager } from '../core/token-manager/RefreshTokenManager.js';

export const createAuthTokenService: TAuthTokenServiceFactory = (deps) => {
  const {
    findOneRefreshTokenFn,
    saveFn,
    deleteRefreshTokenFn,
    deleteAllRefreshTokensForUserFn,
    authConfig,
    secureCookieConfig,
  } = deps;

  try {
    const authTokenManager = new JwtAuthTokenManager({
      options: {
        privateKey: authConfig.privateKey,
        publicKey: authConfig.publicKey,
        accessTokenExpiresIn: authConfig.authToken_TTL_SECONDS,
      },
    });

    const refreshTokenManager = new RefreshTokenManager({
      generatorFn: () => Promise.resolve(generateTypedId('refreshToken')),
      validateRefreshTokenDateFn: input => dateIsNotPassed(input),
      saveRefreshTokenFn: input => saveFn(input),
      deleteRefreshTokenFn: filter => deleteRefreshTokenFn(filter),
      ttlMs: secureCookieConfig.maxAge,
    });

    return new AuthTokenService({
      findRefreshTokenFn: findOneRefreshTokenFn,
      generateAuthTokenFn: authTokenManager.generateAuthToken,
      generateRefreshTokenFn: refreshTokenManager.generateRefreshToken,
      verifyAuthTokenFn: authTokenManager.verifyAuthToken,
      verifyRefreshTokenFn: refreshTokenManager.verifyRefreshToken,
      revokeRefreshTokenFn: refreshTokenManager.revokeRefreshToken,
      deleteAllRefreshTokensForUserFn,
      secureCookieConfig,
    });
  } catch (error) {
    console.error('Error initializing AuthTokenService:', error);
    throw error;
  }
};
