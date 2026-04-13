import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
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

/** Max consecutive failed attempts before locking. */
const MAX_FAILED_ATTEMPTS = 5;
/** Lock duration in milliseconds (15 minutes). */
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export class LoginCommand {
  constructor(public readonly payload: TLoginRequestDTO) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, TLoginCommandResult> {
  private readonly logger = new Logger('Auth');

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
      throw new BusinessError('User account is deactivated.', {
        code: 'USER_DEACTIVATED',
        status: 403,
      });
    }

    if (!user.password) {
      throw new BusinessError('Account not activated — please use the invitation link', {
        code: 'GUEST_NOT_ACTIVATED',
        status: 403,
      });
    }

    // ── Account lockout check ──────────────────────────────
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      this.logger.warn(`Login rejected: account locked — email=${email}`);
      const minutesLeft = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60_000);
      throw new BusinessError(
        `Account temporarily locked. Try again in ${minutesLeft} minute(s).`,
        { code: 'ACCOUNT_LOCKED', status: 429 },
      );
    }

    const { isValid, wasRehashed, newHash } = await this.passwordService.comparePassword({
      password,
      hashedPassword: user.password,
    });

    if (!isValid) {
      // ── Increment failed counter, lock if threshold reached ──
      const failedCount = (user.failed_login_count ?? 0) + 1;
      this.logger.warn(`Login failed: invalid password — email=${email} attempt=${failedCount}`);
      const lockUpdate: Record<string, unknown> = { failed_login_count: failedCount };

      if (failedCount >= MAX_FAILED_ATTEMPTS) {
        lockUpdate['locked_until'] = new Date(Date.now() + LOCKOUT_DURATION_MS);
        this.logger.warn(`Account locked: ${MAX_FAILED_ATTEMPTS} failed attempts — email=${email}`);
      }

      await this.userCredRepo.updateOne({
        filter: { id: user.id } as Record<string, unknown>,
        update: { $set: lockUpdate } as Record<string, unknown>,
      });

      throw new BusinessError('Invalid credentials', { code: 'INVALID_CREDENTIALS', status: 400 });
    }

    // ── Success: reset failed counter ──────────────────────
    if (user.failed_login_count && user.failed_login_count > 0) {
      await this.userCredRepo.updateOne({
        filter: { id: user.id } as Record<string, unknown>,
        update: { $set: { failed_login_count: 0, locked_until: null } } as Record<string, unknown>,
      });
    }

    // Persist the re-hashed password if the algorithm was upgraded
    if (wasRehashed && newHash) {
      await this.userCredRepo.updateOne({
        filter: { id: user.id } as Record<string, unknown>,
        update: { $set: { password: newHash } } as Record<string, unknown>,
      });
    }

    const session = await this.authService.createAuthSession({ user_id: user.id });

    return {
      authToken: session.authToken,
      user_id: user.id,
      refreshTokenSecureCookie: session.refreshTokenSecureCookie,
    };
  }
}
