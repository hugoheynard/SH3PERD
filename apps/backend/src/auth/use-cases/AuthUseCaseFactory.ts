import { Inject, Injectable } from '@nestjs/common';
import type { RegisterUserUseCase } from './RegisterUserUseCase.js';
import type { LoginUseCase } from './LoginUseCase.js';
import type { LogoutUseCase } from './LogoutUseCase.js';
import type { RefreshSessionUseCase } from './RefreshSessionUseCase.js';
import type { TAuthUseCases } from '../types/auth.core.useCase.js';
import { LOGIN_USE_CASE, LOGOUT_USE_CASE, REFRESH_SESSION_USE_CASE, REGISTER_USER_USE_CASE } from '../auth.tokens.js';

/**
 * Factory to create Auth Use Cases
 */
@Injectable()
export class AuthUseCasesFactory {
  constructor(
    @Inject(REGISTER_USER_USE_CASE) private readonly register: RegisterUserUseCase,
    @Inject(LOGIN_USE_CASE) private readonly login: LoginUseCase,
    @Inject(LOGOUT_USE_CASE) private readonly logout: LogoutUseCase,
    @Inject(REFRESH_SESSION_USE_CASE) private readonly refresh: RefreshSessionUseCase,
  ) {}

  create(): TAuthUseCases {
    return {
      registerUseCase: (dto) => this.register.execute(dto),
      loginUseCase: (dto) => this.login.execute(dto),
      logoutUseCase: (dto) => this.logout.execute(dto),
      refreshSessionUseCase: (dto) => this.refresh.execute(dto),
    };
  };
}
