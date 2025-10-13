import { Module } from '@nestjs/common';
import { CoreServicesModule } from '../CoreServiceModule.js';
import {
  CORE_SERVICES,
  VERIFY_AUTH_TOKEN_FN,
  VERIFY_REFRESH_TOKEN_FN,
} from '../../../nestTokens.js';
import type { TVerifyAuthTokenFn } from '../../../../auth/types/auth.core.contracts.js';
import type { TCoreServices } from '../../../initFactories/createCoreServices.js';
import type { TVerifyRefreshTokenFn } from '../../../../auth/core/token-manager/RefreshTokenManager.js';

@Module({
  imports: [CoreServicesModule],
  providers: [
    {
      provide: VERIFY_AUTH_TOKEN_FN,
      useFactory: (coreServices: TCoreServices): TVerifyAuthTokenFn =>
        coreServices.authTokenService.verifyAuthToken.bind(coreServices.authTokenService),
      inject: [CORE_SERVICES],
    },
    {
      provide: VERIFY_REFRESH_TOKEN_FN,
      useFactory: (coreServices: TCoreServices): TVerifyRefreshTokenFn =>
        coreServices.authTokenService.verifyRefreshToken.bind(coreServices.authTokenService),
      inject: [CORE_SERVICES],
    },
  ],
  exports: [VERIFY_AUTH_TOKEN_FN, VERIFY_REFRESH_TOKEN_FN],
})
export class TokenFunctionsModule {
  // This module provides functions for verifying authentication and refresh tokens.
  // It can be extended with additional token-related functionalities as needed.
}
