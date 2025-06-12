import { Module } from '@nestjs/common';
import { CoreUseCasesModule } from '../CoreUseCasesModule.js';
import { AUTH_USECASES, CORE_USECASES } from '../../../nestTokens.js';

@Module({
  imports: [CoreUseCasesModule],
  providers: [
    {
      provide: AUTH_USECASES,
      useFactory: (coreUseCases) => coreUseCases.auth,
      inject: [CORE_USECASES],
    },
  ],
  exports: [AUTH_USECASES],
})
export class AuthUseCasesModule {}
