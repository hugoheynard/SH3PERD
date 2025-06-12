import { Module } from '@nestjs/common';
import { CoreServicesModule } from '../CoreServiceModule.js';

@Module({
  imports: [CoreServicesModule],
  providers: [
    {
      provide: 'VERIFY_AUTH_TOKEN_FN',
      useFactory: (coreServices) => coreServices.authTokenService.verifyAuthToken,
      inject: ['CORE_SERVICES'],
    },
    {
      provide: 'VERIFY_REFRESH_TOKEN_FN',
      useFactory: (coreServices) => coreServices.authTokenService.verifyRefreshToken,
      inject: ['CORE_SERVICES'],
    },
  ],
  exports: ['VERIFY_AUTH_TOKEN_FN', 'VERIFY_REFRESH_TOKEN_FN']
})
export class TokenFunctionsModule {}