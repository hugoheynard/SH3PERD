import { Module } from '@nestjs/common';
import {
  VERIFY_AUTH_TOKEN_FN,
  VERIFY_REFRESH_TOKEN_FN,
} from '../../appBootstrap/nestTokens.js';
import type { TVerifyAuthTokenFn } from '../types/auth.core.contracts.js';
import type {
  IAbstractRefreshTokenService,
  TVerifyRefreshTokenFn,
} from './token-manager/RefreshTokenService.js';
import { AuthCoreModule } from './auth-core.module.js';

import type { IAbstractJWTService } from './token-manager/JwtService.js';
import { JWT_SERVICE, REFRESH_TOKEN_SERVICE } from '../auth.tokens.js';

@Module({
  imports: [AuthCoreModule],
  providers: [
    {
      provide: VERIFY_AUTH_TOKEN_FN,
      useFactory: (jwtService: IAbstractJWTService): TVerifyAuthTokenFn =>
        (x) => jwtService.verifyAuthToken(x),
      inject: [JWT_SERVICE],
    },
    {
      provide: VERIFY_REFRESH_TOKEN_FN,
      useFactory: (refreshTokenService: IAbstractRefreshTokenService): TVerifyRefreshTokenFn =>
        (x)=>refreshTokenService.verifyRefreshToken(x),
      inject: [REFRESH_TOKEN_SERVICE],
    },
  ],
  exports: [VERIFY_AUTH_TOKEN_FN, VERIFY_REFRESH_TOKEN_FN],
})
export class TokenFunctionsModule {
  // This module provides functions for verifying authentication and refresh tokens.
  // It can be extended with additional token-related functionalities as needed.
}
