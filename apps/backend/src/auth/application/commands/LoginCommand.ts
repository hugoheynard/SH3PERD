import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { TLoginRequestDTO, TLoginResponseDTO } from '@sh3pherd/shared-types';
import type { IPasswordService } from '../../core/password-manager/types/Interfaces.js';
import type { IAuthTokenService } from '../../services/auth.service.js';
import type { IUserCredentialsRepository } from '../../../user/infra/UserCredentialsMongoRepo.repository.js';
import type { TRefreshTokenSecureCookie } from '../../types/auth.domain.tokens.js';
import { AUTH_SERVICE, PASSWORD_SERVICE } from '../../auth.tokens.js';
import { USER_CREDENTIALS_REPO } from '../../../appBootstrap/nestTokens.js';
import { BusinessError } from '../../../utils/errorManagement/BusinessError.js';

export type TLoginCommandResult = TLoginResponseDTO & {
  refreshTokenSecureCookie: TRefreshTokenSecureCookie;
};

export class LoginCommand {
  constructor(public readonly payload: TLoginRequestDTO) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, TLoginCommandResult> {
  constructor(
    @Inject(USER_CREDENTIALS_REPO) private readonly userCredRepo: IUserCredentialsRepository,
    @Inject(PASSWORD_SERVICE) private readonly passwordService: IPasswordService,
    @Inject(AUTH_SERVICE) private readonly authService: IAuthTokenService,
  ) {}

  async execute(cmd: LoginCommand): Promise<TLoginCommandResult> {
    const { email, password } = cmd.payload;

    const user = await this.userCredRepo.findOne({ filter: { email } });
    if (!user) {
      throw new BusinessError('Invalid credentials', { code: 'INVALID_CREDENTIALS', status: 400 });
    }

    if (!user.active) {
      throw new BusinessError('User account is deactivated.', { code: 'USER_DEACTIVATED', status: 403 });
    }

    const { isValid } = await this.passwordService.comparePassword({ password, hashedPassword: user.password });
    if (!isValid) {
      throw new BusinessError('Invalid credentials', { code: 'INVALID_CREDENTIALS', status: 400 });
    }

    const session = await this.authService.createAuthSession({ user_id: user.id });

    return {
      authToken: session.authToken,
      user_id: user.id,
      refreshTokenSecureCookie: session.refreshTokenSecureCookie,
    };
  }
}
