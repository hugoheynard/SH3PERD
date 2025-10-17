import { Module } from '@nestjs/common';
import { AuthCoreModule } from '../core/auth-core.module.js';
import { RegisterUserUseCase } from './RegisterUserUseCase.js';
import { LoginUseCase } from './LoginUseCase.js';
import { LogoutUseCase } from './LogoutUseCase.js';
import { RefreshSessionUseCase } from './RefreshSessionUseCase.js';
import { AuthUseCasesFactory } from './AuthUseCaseFactory.js';
import {
  AUTH_USE_CASES, AUTH_USE_CASES_FACTORY,
  LOGIN_USE_CASE,
  LOGOUT_USE_CASE,
  REFRESH_SESSION_USE_CASE,
  REGISTER_USER_USE_CASE,
} from '../auth.tokens.js';


@Module({
  imports: [AuthCoreModule],
  providers: [
    { provide: AUTH_USE_CASES_FACTORY, useClass: AuthUseCasesFactory },
    {
      provide: AUTH_USE_CASES,
      useFactory: (factory: AuthUseCasesFactory) => factory.create(),
      inject: [AUTH_USE_CASES_FACTORY],
    },
    { provide: REGISTER_USER_USE_CASE, useClass: RegisterUserUseCase },
    { provide: LOGIN_USE_CASE, useClass: LoginUseCase },
    { provide: LOGOUT_USE_CASE, useClass: LogoutUseCase },
    { provide: REFRESH_SESSION_USE_CASE, useClass: RefreshSessionUseCase },
  ],
  exports: [AUTH_USE_CASES],
})
export class AuthUseCasesModule {}
