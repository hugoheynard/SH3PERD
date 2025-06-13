import { Module } from '@nestjs/common';
import { CoreServicesModule } from '../CoreServiceModule.js';
import { CORE_SERVICES, VERIFY_AUTH_TOKEN_FN, VERIFY_REFRESH_TOKEN_FN } from '../../../nestTokens.js';

@Module({
  imports: [CoreServicesModule],
  providers: [
    {
      provide: VERIFY_AUTH_TOKEN_FN,
      useFactory: (coreServices: any) => coreServices.authTokenService.verifyAuthToken.bind(coreServices.authTokenService),
      inject: [CORE_SERVICES],
    },
    {
      provide: VERIFY_REFRESH_TOKEN_FN,
      useFactory: (coreServices) => {
        console.log('[INIT] VERIFY_REFRESH_TOKEN_FN: ', coreServices);
        return coreServices.authTokenService.verifyRefreshToken;
      },
      inject: [CORE_SERVICES],
    },
  ],
  exports: [VERIFY_AUTH_TOKEN_FN, VERIFY_REFRESH_TOKEN_FN]
})
export class TokenFunctionsModule {
  constructor() {
    console.log('[NEST]: TokenFunctionsModule initialized');
    // This module provides functions for verifying authentication and refresh tokens.
    // It can be extended with additional token-related functionalities as needed.
  }
}