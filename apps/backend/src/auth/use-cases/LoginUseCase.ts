import type { TLoginRequestDTO, TLoginResponseDTO } from '@sh3pherd/shared-types';
import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';
import type { IUserCredentialsRepository } from '../../user/credentials/UserCredentialsMongoRepo.repository.js';
import { Inject, Injectable } from '@nestjs/common';
import type { IPasswordService } from '../core/password-manager/types/Interfaces.js';
import type { IAuthTokenService } from '../services/auth.service.js';
import type { TRefreshTokenSecureCookie } from '../types/auth.domain.tokens.js';
import { AUTH_SERVICE, PASSWORD_SERVICE } from '../auth.tokens.js';
import { USER_CREDENTIALS_REPO } from '../../appBootstrap/nestTokens.js';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredRepo: IUserCredentialsRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
    @Inject(AUTH_SERVICE) private readonly authService: IAuthTokenService
  ) {}

  /**
   * loginUseCase - Handles user authentication using email and password.
   *
   * This function orchestrates the login process:
   * - Looks up the user by email
   * - Verifies the password using the injected hashing service
   * - Creates a full authentication session (access + refresh tokens)
   *
   * @param request - The request object containing email and password
   *
   * @returns A function that takes a LoginRequestDTO and returns a LoginResponseDTO
   *
   * @throws Error if credentials are invalid (email not found or password mismatch)
   *
   * @example
   * const useCase = loginUseCase({ findUserByEmailFn, comparePasswordFn, createAuthSessionFn });
   * const result = await useCase({ email: 'a@test.com', password: 'secret' });
   */
  async execute(request: TLoginRequestDTO): Promise<TLoginResponseDTO & { refreshTokenSecureCookie: TRefreshTokenSecureCookie
  }> {
    const { email, password } = request;

    const user = await this.userCredRepo.findOne({ email });
    if (!user) {
      throw new BusinessError('Invalid credentials', 'INVALID_CREDENTIALS', 400);
    }

    if (!user.active) {
      throw new BusinessError('User account is deactivated.', 'USER_DEACTIVATED', 403);
    }

    const { isValid } = await this.passwordService.comparePassword({ password, hashedPassword: user.password });

    if (!isValid) {
      throw new BusinessError('Invalid credentials', 'INVALID_CREDENTIALS', 400);
    }

    const session = await this.authService.createAuthSession({ user_id: user.id });

    return {
      authToken: session.authToken,
      user_id: user.id,
      refreshTokenSecureCookie: session.refreshTokenSecureCookie,
    };
  }
}
